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
		etag = null,
		lastModified = null;

	//correct root path
	var storageConfig = nconf.get('storageConfig');
	var hooks = nconf.get('hooks');
	storageConfig.dbPath = path.join(__dirname, storageConfig.dbPath);
	storageConfig.rightsPath = path.join(__dirname, storageConfig.rightsPath);
	storageConfig.backupPath = path.join(__dirname, storageConfig.backupPath);
	storageConfig.hooks = hooks;

	var staticConfig = nconf.get('staticConfig');
	staticConfig.filesPath = path.join(__dirname, staticConfig.filesPath);
	staticConfig.rightsPath = path.join(__dirname, staticConfig.rightsPath);
	staticConfig.hooks = hooks;

	var templateConfig = nconf.get('templateConfig');
	templateConfig.filesPath = path.join(__dirname, templateConfig.filesPath);
	templateConfig.rightsPath = path.join(__dirname, templateConfig.rightsPath);
	templateConfig.hooks = hooks;
	templateConfig.templateData = {
		url: api.url,
		apiKey: api.apiKey,
		username: admin.username,
		password: admin.password
	};

	var taskConfig = nconf.get('taskConfig');
	taskConfig.tasksPath = path.join(__dirname, taskConfig.tasksPath);
	taskConfig.jobsPath = path.join(__dirname, taskConfig.jobsPath);
	taskConfig.mapreducePath = path.join(__dirname, taskConfig.mapreducePath);
	taskConfig.rightsPath = path.join(__dirname, taskConfig.rightsPath);
	taskConfig.hooks = hooks;

	var pushConfig = nconf.get('pushConfig');
	pushConfig.APN_Sandbox_Pfx = path.join(__dirname, pushConfig.APN_Sandbox_Pfx);
	pushConfig.APN_Pfx = pushConfig.APN_Pfx ? path.join(__dirname, pushConfig.APN_Pfx) : '';
	pushConfig.MPNS_Pfx = (pushConfig.MPNS_Pfx && fs.existsSync(path.join(__dirname, pushConfig.MPNS_Pfx))) ? path.join(__dirname, pushConfig.MPNS_Pfx) : '';

	//init
	if(!fs.existsSync(storageConfig.rightsPath))
		fs.writeFileSync(storageConfig.rightsPath, '{"public":[]}');

	var utils = require('./lib/helper.js');
	var doc = require('./lib/doc.module.js');
	var	pubsub = require('./lib/pubsub.module.js').init({pollInterval: 1});
	var storage = require('./lib/store.module.js').init(storageConfig);
	var identity = require('./lib/identity.module.js');
	var es = require('./lib/eventsource.module.js').init(storage, pubsub);
	var template = require('./lib/template.module.js');
	var task = require('./lib/task.module.js').init(taskConfig, storage, pubsub, push, es);

	var renderer = template.init({templatesPath: templateConfig.filesPath});


	var pushIdentity = identity.init('push', storage);
	var push = require('./lib/push-module.js').init(pushConfig, storage, pushIdentity);
	var accountIdentity = identity.init('account', storage);
	var account = require('./lib/account-module.js').init(accountIdentity);
	var location = require('./lib/location-module.js').init(storage);

	var options = { name: 'subkit microservice' };
	//configure HTTPS/SSL
	if(app.key) options.key = fs.readFileSync(app.key);
	if(app.cert) options.certificate = fs.readFileSync(app.cert);
	var	server = restify.createServer(options);

	//conf reload
	var reloadConf = function(){
		nconf.file('config', path.join(__dirname, 'config.json'));
	  	nconf.file('defaults', path.join(__dirname, 'defaults.json'));
		admin = nconf.get('admin');
		app = nconf.get('app');
		api = nconf.get('api');
		hooks = nconf.get('hooks');
	};
	fs.watchFile(path.join(__dirname, 'config.json'), reloadConf);
	fs.watchFile(path.join(__dirname, 'defaults.json'), reloadConf);

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
		res.header('ETag', etag);
		res.header('Last-Modified', lastModified);
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
		res.send(500, err.message);
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
		version:      '1.2',
		basePath:     api.url
	});
	//docu
	var rendererDevCenter = template.init({
		templatesPath: path.join(__dirname, 'files/mobile')
	});
	server.get('/doc', function(req, res, next){
		var consoleData = {
		  url: api.url,
		  apiKey: api.apiKey,
		  username: admin.username,
		  password: admin.password
		};
		rendererDevCenter.render('doc', consoleData, function(err, html){
		  res.contentType = 'text/html';
		  res.write(html);
		  res.end();
		});
		return next();
	});

	//development center
	var rendererMobileCenter = template.init({
		templatesPath: path.join(__dirname, 'files/mobile')
	});
	server.get('/', function(req, res, next){
		var consoleData = {
		  url: api.url,
		  apiKey: api.apiKey,
		  username: admin.username,
		  password: admin.password
		};
		rendererMobileCenter.render('index', consoleData, function(err, html){
		  res.contentType = 'text/html';
		  res.write(html);
		  res.end();
		});
		return next();
	});
	//javascript SDKs
	server.get(/\/sdk\/?.*/, restify.serveStatic({
	  directory: path.join(__dirname, 'files')
	}));

	//start web server
	server.listen(app.port, function(){
		console.log('subkit microservice listen on: ' + server.address().port);
		console.log('PID: ' + process.pid);
		http.globalAgent.maxSockets = 50000;
	});

	var helper = utils.init(admin, api, etag, lastModified, storage);
	helper.setNewETag();

	require('./lib/manage.js').init(nconf, api, app, server, storage, helper, doc);
	require('./lib/store.js').init(server, storage, helper, doc);
	require('./lib/pubsub.js').init(server, pubsub, helper, doc);
	require('./lib/template.js').init(server, templateConfig, renderer, helper, doc);
	require('./lib/task.js').init(server, storage, taskConfig, task, helper, doc);
	require('./lib/statistics.js').init(server, storage, staticConfig, pubsub, helper, doc);
	require('./lib/eventsource.js').init(server, es, helper, doc);

	require('./lib/static.js').init(server, staticConfig, helper, doc);
	require('./lib/account.js').init(server, account, helper, doc);
	require('./lib/push.js').init(server, nconf, pushConfig, push, helper, doc);
	require('./lib/location.js').init(server, location, helper, doc);

	//plugins
	var plugins = require('./package.json').optionalDependencies;
	var pluginContext = {
		Server: server,
		NConf: nconf,
		Helper: helper,
		Doc: doc,
		Storage: storage,
		PubSub: pubsub,
		Identity: identity,
		EventSource: es, 
		Renderer: renderer
	};
	for(var pluginName in plugins){
		console.log('Loading plugin: ' + pluginName);
		require(pluginName).init(pluginContext);
	}

	//all other resources
	server.get(/\/css\/.+/, restify.serveStatic({
	  directory: path.join(__dirname, 'files/mobile')
	}));
	server.get(/\/libs\/.+/, restify.serveStatic({
	  directory: path.join(__dirname, 'files/mobile')
	}));
	server.get(/\/js\/.+/, restify.serveStatic({
	  directory: path.join(__dirname, 'files/mobile')
	}));
	server.get(/\/img\/.+/, restify.serveStatic({
	  directory: path.join(__dirname, 'files/mobile')
	}));
	server.get(/\/doc\/.+/, restify.serveStatic({
	  directory: path.join(__dirname, 'files/mobile')
	}));

	return {
		getContext: function(){
			return pluginContext;
		}
	};
};
