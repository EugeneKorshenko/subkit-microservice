'use strict';

var restify = require('restify'),
	http = require('http'),
	fs = require('fs'),
	path = require('path'),
	nconf = require('nconf');

module.exports.init = function(){
	//config
	nconf
		.argv()
		.env()
		.file('config', path.join(__dirname, 'config.json'))
	  	.file('defaults', path.join(__dirname, 'defaults.json'));

	var admin = nconf.get('admin'),
		app = nconf.get('app'),
		api = nconf.get('api'),
		etag = {etag:'', lastModified:''};

	//correct root path
	var storageConfig = nconf.get('storageConfig');
	storageConfig.dbPath = path.join(__dirname, storageConfig.dbPath);
	storageConfig.rightsPath = path.join(__dirname, storageConfig.rightsPath);
	storageConfig.backupPath = path.join(__dirname, storageConfig.backupPath);

	var workerConfig = nconf.get('taskConfig');
	workerConfig.tasksPath = path.join(__dirname, workerConfig.tasksPath);
	workerConfig.jobsPath = path.join(__dirname, workerConfig.jobsPath);
	workerConfig.mapreducePath = path.join(__dirname, workerConfig.mapreducePath);
	workerConfig.rightsPath = path.join(__dirname, workerConfig.rightsPath);

	//init
	if(!fs.existsSync(storageConfig.rightsPath))
		fs.writeFileSync(storageConfig.rightsPath, '{"public":[]}');

	var utils = require('./lib/helper.js');
	var storage = require('./lib/store.module.js').init(storageConfig);
	var	pubsub = require('./lib/pubsub.module.js').init({pollInterval: 1}, storage);
	var doc = require('./lib/doc.module.js');
	var file = require('./lib/file.module.js');
	var es = require('./lib/eventsource.module.js').init(storage, pubsub);
	var worker = require('./lib/worker.module.js').init(workerConfig, storage, pubsub, es);
	var template = require('./lib/template.module.js');
	var identity = require('./lib/identity.module.js');
	
	var options = { name: 'subkit microservice' };
	//configure HTTPS/SSL
	if(app.key && fs.existsSync(app.key)) options.key = fs.readFileSync(app.key);
	if(app.cert && fs.existsSync(app.cert)) options.certificate = fs.readFileSync(app.cert);
	var	server = restify.createServer(options);

	//conf reload
	var reloadConf = function(){
		nconf.file('config', path.join(__dirname, 'config.json'));
	  	nconf.file('defaults', path.join(__dirname, 'defaults.json'));
		admin = nconf.get('admin');
		app = nconf.get('app');
		api = nconf.get('api');
	};
	fs.watchFile(path.join(__dirname, 'config.json'), reloadConf);
	fs.watchFile(path.join(__dirname, 'defaults.json'), reloadConf);

	var helper = utils.init(admin, api, etag, storage);
	helper.setNewETag();

	//server middleware
	server.acceptable.push('text/html');
	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.bodyParser({ mapParams: true }));
	server.use(restify.fullResponse());
	server.use(restify.authorizationParser());
	server.use(restify.dateParser());
	server.use(restify.queryParser());
	server.use(restify.gzipResponse());

	//etag
	server.use(function (req, res, next) {
		res.header('ETag', etag.etag);
		res.header('Last-Modified', etag.lastModified);
		return next();
	});
	server.use(restify.conditionalRequest());
	server.pre(restify.pre.sanitizePath());
	server.pre(restify.pre.userAgentConnection());

	//CORS
	server.opts(/\.*/, function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, HEAD, OPTION');
		res.header('Access-Control-Allow-Headers', 'authorization, content-type, x-requested-with, x-auth-token, api_key, apikey');
		res.send(200);
		return next();
	});

	//handle errors
	process.stdin.resume();
	server.on('uncaughtException', function (req, res, route, err) {
		console.log('A uncought exception was thrown: ' + route + ' -> ' + err.message);
	});
	function exitHandler(options, err) {
	    if (options.cleanup) {
	    	storage.close();
	    	console.log('clean up');
	    }
	    if (err) console.log(err.stack);
	    if (options.exit) process.exit();
	}

	process.on('exit', exitHandler.bind(null,{cleanup:true}));
	process.on('SIGINT', exitHandler.bind(null, {exit:true}));
	process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

	//JSON doc
	doc = doc.configure(server, {
		discoveryUrl: '/docs',
		version: '1.2',
		basePath: app.key ? 'https:' + api.url : 'http:' + api.url
	});

	//start web server
	server.listen(app.port, function(){
		console.log('subkit microservice listen on: ' + server.address().port);
		console.log('PID: ' + process.pid);
		http.globalAgent.maxSockets = 50000;
	});

	worker.scheduler.scheduleTasks();
	worker.scheduler.scheduleMapReduce();	
	worker.scheduler.schedule({
		jobName: 'periodic',
		cronTime: '* * * * *',
		payload: {name: 'payload value'}
	});

	require('./lib/manage.js').init(nconf, api, app, server, storage, helper, doc);
	require('./lib/store.js').init(server, storage, helper, doc);
	require('./lib/pubsub.js').init(server, pubsub, helper, doc);
	require('./lib/statistics.js').init(server, storage, pubsub, helper, doc);
	require('./lib/eventsource.js').init(server, es, helper, doc);
	
	//plugins
	var availablePlugins = require('./package.json').optionalDependencies;
	var pluginContext = {
		AvailablePlugins: availablePlugins,
		Server: server,
		Configuration: nconf,
		Helper: helper,
		Doc: doc,
		Storage: storage,
		PubSub: pubsub,
		EventSource: es,
		File: file,
		Template: template,
		Worker: worker,
		Identity: identity,
		ServeStatic: restify.serveStatic
	};

	var plugin = require('./lib/plugin.module.js').init(pluginContext);
	plugin.loadAll();
	require('./lib/plugin.js').init(server, plugin, helper, doc);

	return {
		getContext: function(){
			return pluginContext;
		}
	};
};
