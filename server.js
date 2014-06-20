'use strict';

var restify = require('restify'),
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	path = require('path'),
	nconf = require('nconf'),
	subkitPackage = require('./package.json');

module.exports.init = function(){
	var admin,
		app,
		api,
		storageConfig,
		workerConfig,
		templateConfig,
		staticConfig,
		etag = {etag:'', lastModified:''};

	//load and apply configuration
	var _applyConfig = function(){
	  	nconf.file('config', path.join(__dirname, 'config.json'));		
	  	nconf.file('defaults', path.join(__dirname, 'defaults.json'));

		admin = nconf.get('admin');
		app = nconf.get('app');
		api = nconf.get('api');
		storageConfig = nconf.get('storageConfig');
		workerConfig = nconf.get('workerConfig');
		templateConfig = nconf.get('templateConfig');
		staticConfig = nconf.get('staticConfig');
		
		if(!fs.existsSync(path.join(__dirname, 'config.json'))){
			nconf.remove('defaults');
			nconf.set('admin', admin);
			nconf.set('app', app);
			nconf.set('api', api);
			nconf.set('storageConfig', storageConfig);
			nconf.set('workerConfig', workerConfig);
			nconf.set('templateConfig', templateConfig);
			nconf.set('staticConfig', staticConfig);
			nconf.save();
		}
		
		//correct root path
		app.key = path.join(__dirname, app.key);
		app.cert = path.join(__dirname, app.cert);
		storageConfig.dbPath = path.join(__dirname, storageConfig.dbPath);
		storageConfig.backupPath = path.join(__dirname, storageConfig.backupPath);
		workerConfig.tasksPath = path.join(__dirname, workerConfig.tasksPath);
		templateConfig.templatesPath = path.join(__dirname, templateConfig.templatesPath);
		staticConfig.staticsPath = path.join(__dirname, staticConfig.staticsPath);
	};
	_applyConfig();
	
	//configure HTTPS/SSL server
	var options = { name: 'subkit microservice' };
	if(app.key && fs.existsSync(app.key)) options.key = fs.readFileSync(app.key);
	if(app.cert && fs.existsSync(app.cert)) options.certificate = fs.readFileSync(app.cert);
	var	server = restify.createServer(options);

	//Middleware
	server.acceptable.push('text/html');
	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.bodyParser({ mapParams: true }));
	server.use(restify.CORS({
		origins: ['*'],
		credentials: true,
		headers: ['authorization','content-type','x-requested-with','x-auth-token','api_key','apikey','subkit-log']
	}));	
	server.use(restify.fullResponse());
	server.use(restify.authorizationParser());
	server.use(restify.dateParser());
	server.use(restify.queryParser());
	server.use(restify.gzipResponse());
	server.use(function (req, res, next) {
		res.header('ETag', etag.etag);
		res.header('Last-Modified', etag.lastModified);
		return next();
	});
	server.use(restify.conditionalRequest());
	server.pre(restify.pre.sanitizePath());
	server.pre(restify.pre.userAgentConnection());

	//handle CORS
	server.opts(/\.*/, function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, HEAD, OPTION');
		res.header('Access-Control-Allow-Headers', 'authorization, content-type, x-requested-with, x-auth-token, api_key, apikey, subkit-log');
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

	//handle share access
	server.use(function(req, res, next){		
		var apikey = req.headers['x-auth-token'] || req.params.apiKey || req.params.api_Key || req.headers.apikey || req.headers.api_key;
		if(api.apiKey === apikey) {
			return next();
		}

		if((req.authorization)
			&& (req.authorization.basic)
			&& (req.username === admin.username)
			&& (req.authorization.basic.password === admin.password)){

			return next();
		}
 		
		//check share access
		var urlParts = req.url.split('/');
		var shareIdent = '';
		for (var i = 1; i < urlParts.length; i++) {
			shareIdent = shareIdent + '/' + urlParts[i];
			var shareItem = share.list()[shareIdent];
			if(shareItem){
				var username = apikey || req.username;
				if(shareItem[req.method].indexOf(username) !== -1){
					return next();
				}
			}
		};
		res.send(401);
	});

	//JSON doc
	var doc = require('./lib/doc.module.js');
	doc = doc.configure(server, {
		discoveryUrl: '/docs',
		version: '1.2',
		basePath: app.key ? 'https://localhost:'+app.port : 'http://localhost:'+app.port
	});

	//Modules
	var storage = require('./lib/store.module.js').init(storageConfig);
	var	pubsub = require('./lib/pubsub.module.js').init({pollInterval: 1}, storage);
	var share = require('./lib/share.module.js').init({}, pubsub);
	var file = require('./lib/file.module.js');
	var es = require('./lib/eventsource.module.js').init(storage, pubsub);
	var worker = require('./lib/worker.module.js').init(workerConfig, storage, pubsub, es, doc);
	var template = require('./lib/template.module.js');
	var identity = require('./lib/identity.module.js');
	var utils = require('./lib/helper.js');
	var helper = utils.init(admin, api, etag, storage);
	helper.setNewETag();

	//start web server
	server.listen(app.port, function(){
		console.log('Subkit micro-service (V'+subkitPackage.version+') listen.');
		console.log('ENVIRONMENT: '+process.env.NODE_ENV || 'development');
		console.log('SECURE: '+server.secure);
		console.log('PORT: '+server.address().port);
		console.log('PID: '+process.pid);
		http.globalAgent.maxSockets = 50000;
		https.globalAgent.maxSockets = 50000;
	});
	//starts the tasks scheduler
	worker.runScheduler(true);

	//starts external API
	require('./lib/manage.js').init(nconf, api, app, server, storage, helper, doc);
	require('./lib/store.js').init(server, storage, helper, doc);
	require('./lib/pubsub.js').init(server, pubsub, helper, doc);
	require('./lib/statistics.js').init(server, storage, pubsub, es, helper, doc);
	require('./lib/worker.js').init(server, worker, helper);
	
	//plugins
	var availablePlugins = subkitPackage.optionalDependencies;
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
