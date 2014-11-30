'use strict';

var restify = require('restify'),
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	path = require('path'),
	nconf = require('nconf'),
	subkitPackage = require('./package.json'),
	utils = require('./lib/helper.js').init();    

module.exports.init = function(){
	var admin,
		app,
		api,
		paths,
		etag = {etag:'', lastModified:''};

	//load and apply configuration
	var _applyConfig = function(){
		var configFilePath = path.join(process.cwd(),'files','config');
	  	nconf.file('config', path.join(configFilePath, 'config.json'));		
	  	nconf.file('defaults', path.join(__dirname, 'defaults.json'));

		admin = nconf.get('admin');
		app = nconf.get('app');
		api = nconf.get('api');
		paths = nconf.get('paths');
		
		if(!fs.existsSync(path.join(configFilePath,'config.json'))){
			utils.mkdirRecursive(configFilePath);

			nconf.remove('defaults');
			nconf.set('admin', admin);
			nconf.set('app', app);
			nconf.set('api', api);
			nconf.set('paths', paths);
			nconf.save();
		}
		
		if(app.key) app.key = path.join(process.cwd(), app.key);
		if(app.cert) app.cert = path.join(process.cwd(), app.cert);
		paths.dbPath = path.join(process.cwd(), paths.dbPath);
		paths.backupPath = path.join(process.cwd(), paths.backupPath);
		paths.tasksPath = path.join(process.cwd(), paths.tasksPath);
		paths.templatesPath = path.join(process.cwd(), paths.templatesPath);
		paths.staticsPath = path.join(process.cwd(), paths.staticsPath);
	};
	_applyConfig();
	
	//configure and start HTTPS/SSL server
	var _applyServer = function(){
		var options = { name: 'subkit microservice' };

		if(!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
		if(app.key && fs.existsSync(app.key)) options.key = fs.readFileSync(app.key);
		if(app.cert && fs.existsSync(app.cert)) options.certificate = fs.readFileSync(app.cert);
		
		var	srv = restify.createServer(options);
		srv.listen(app.port, function(){
			utils.log('Subkit micro-service (V'+subkitPackage.version+') listen.');
			utils.log('ENVIRONMENT: '+process.env.NODE_ENV);
			utils.log('SECURE: '+srv.secure);
			utils.log('PORT: '+srv.address().port);
			utils.log('PID: '+process.pid);

			http.globalAgent.maxSockets = 50000;
			https.globalAgent.maxSockets = 50000;
		});
		return srv;	
	};
	var server = _applyServer();

	//Middleware
	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.bodyParser({ mapParams: true }));
	server.use(restify.CORS({
		origins: ['*'],
		credentials: true,
		headers: ['authorization','content-type','x-auth-token','subkit-log']
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
		res.header('Access-Control-Allow-Headers', 'authorization, content-type, x-auth-token, subkit-log');
		res.send(200);
		return next();
	});


	//handle errors	
	process.stdin.resume();
	server.on('uncaughtException', function (req, res, route, err) {
		utils.trace(err, route);
	});
	function exitHandler(options, err) {
	    if (err) {
	    	utils.trace(err);
	    }
	    if (options.cleanup) {
	    	storage.close();
	    	utils.log('Clean up resources.');
	    }
	    if (options.exit) {
	    	utils.log( 'Process exit.');
	    	process.exit();
	    }
	}
	process.on('abort', exitHandler.bind(null,{cleanup:true, exit:true}));
	process.on('exit', exitHandler.bind(null,{cleanup:true, exit:true}));
	process.on('SIGINT', exitHandler.bind(null, {cleanup: true, exit:true}));
	process.on('uncaughtException', exitHandler.bind(null, {exit:false}));
	
	//Modules
	var storage = require('./lib/store.module.js').init(paths);
	var	pubsub = require('./lib/pubsub.module.js').init({pollInterval: 1}, storage);
	var share = require('./lib/share.module.js').init({}, pubsub);
	var file = require('./lib/file.module.js');
	var es = require('./lib/eventsource.module.js').init(storage, pubsub);
	var template = require('./lib/template.module.js');
	var worker = require('./lib/worker.module.js').init(paths, storage, pubsub, es, template.init(paths), file.init(paths), doc);
	var identity = require('./lib/identity.module.js');

    var usersIdent = identity.init(null, storage);
	//handle share access
	server.use(function(req, res, next){
		var apikey = req.headers['x-auth-token'] || req.params.apikey || req.params.api_key;
		var token = null;

		if(api.apiKey === apikey) {
			return next();
		}
		if((req.authorization)
			&& (req.authorization.basic)
			&& (req.username === admin.username)
			&& (utils.validate(admin.password, req.authorization.basic.password))){

			return next();
		}
 		if(!apikey && req.username && req.authorization && req.authorization.basic && req.authorization.basic.password){
 			apikey = req.username;
 			token = req.authorization.basic.password;
 		}
		usersIdent.validate(apikey,token,function(error, user){
			//check share access
                        var cleanupUrl = req.url.substr(0, req.url.indexOf('?'));
                        var urlParts = cleanupUrl.split('/');
			var shareIdent = '';
			for (var i = 1; i < urlParts.length; i++) {
				shareIdent = shareIdent + '/' + urlParts[i];
				var shareItem = share.list()[shareIdent];
				if(shareItem){
					var username = null;

					if(user) username = user.id;
					else username = req.username;

					if(shareItem[req.method].indexOf(username) !== -1){
						return next();
					}
					
					if(user && user.groups){
						for (var i = 0; i < user.groups.length; i++) {
							var group = user.groups[i];
							if(shareItem[req.method].indexOf(group) !== -1){
								return next();
							};
						};
					}
				}
			}
			res.send(401, new Error('Unauthorized'));
		});
	});

	//JSON doc
	var doc = require('./lib/doc.module.js');
	doc = doc.configure(server, {
		discoveryUrl: '/docs',
		version: '1.2',
		basePath: app.key ? 'https://localhost:'+app.port : 'http://localhost:'+app.port
	});


	//starts the tasks scheduler
	worker.runScheduler(true);

	//starts external API
	require('./lib/manage.js').init(nconf, _applyConfig, server, _applyServer, storage, doc);
	require('./lib/store.js').init(server, storage, doc);
	require('./lib/share.js').init(server, share, doc);
	require('./lib/pubsub.js').init(server, pubsub, doc);
	require('./lib/statistics.js').init(server, storage, pubsub, es, doc);
	require('./lib/worker.js').init(server, worker);

	//plugins
	var availablePlugins = subkitPackage.optionalDependencies;
	var pluginContext = {
		AvailablePlugins: availablePlugins,
		Server: server,
		Configuration: nconf,
		Utils: utils,
		Doc: doc,
		Storage: storage,
		Share: share,
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
	require('./lib/plugin.js').init(server, plugin, doc);

	return {
		getContext: function(){
			return pluginContext;
		}
	};
};
