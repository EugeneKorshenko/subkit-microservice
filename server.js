'use strict';

var restify = require('restify');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var nconf = require('nconf');
var subkitPackage = require('./package.json');
var utils = require('./lib/utils.module.js').init();    

module.exports.init = function(){
	var admin;
	var app;
	var api;
	var paths;

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
		if(app.ca) app.ca = path.join(process.cwd(), app.ca);

		paths.dbPath = path.join(process.cwd(), paths.dbPath);
		paths.backupPath = path.join(process.cwd(), paths.backupPath);
		paths.tasksPath = path.join(process.cwd(), paths.tasksPath);
		paths.templatesPath = path.join(process.cwd(), paths.templatesPath);
		paths.staticsPath = path.join(process.cwd(), paths.staticsPath);
	};
	_applyConfig();
	
	//configure and start HTTPS/SSL server
	var _applyServer = function(){
		var options = { name: 'subkit microservice', version: subkitPackage.version };

		if(!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
		if(app.key && fs.existsSync(app.key)) options.key = fs.readFileSync(app.key);
		if(app.cert && fs.existsSync(app.cert)) options.certificate = fs.readFileSync(app.cert);
		if(app.ca && fs.existsSync(app.ca)) options.ca = fs.readFileSync(app.ca);
		
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
	server.formatters['text/html'] = require('restify-formatter-text');
	server.acceptable.push('text/html');

	//middleware
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
	
	//modules
	var storage = require('./lib/store.module.js').init(paths);
	var	event = require('./lib/event.module.js').init({}, storage);
	var share = require('./lib/share.module.js').init({}, event);
	var file = require('./lib/file.module.js');
	var es = require('./lib/eventsource.module.js').init(storage, event);
	var template = require('./lib/template.module.js');
	var task = require('./lib/task.module.js').init(paths, storage, event, es, template.init(paths), file.init(paths), doc);
	var identity = require('./lib/identity.module.js');

    //handle access
    var usersIdent = identity.init(null, storage);	
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
            var cleanupUrl = req.url.indexOf('?') !== -1 ? req.url.substr(0, req.url.indexOf('?')) : req.url;
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
						for (var p = 0; p < user.groups.length; p++) {
							var group = user.groups[p];
							if(shareItem[req.method].indexOf(group) !== -1){
								return next();
							}
						}
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
	task.runScheduler(true);

	//plugins
	var pluginContext = {
		plugins: subkitPackage.optionalDependencies,
		server: server,
		configuration: nconf,
		util: utils,
		doc: doc,
		storage: storage,
		permission: share,
		event: event,
		eventSource: es,
		file: file,
		template: template,
		task: task,
		identity: identity,
		serve: restify.serveStatic
	};

	var plugin = require('./lib/plugin.module.js').init(pluginContext);
	plugin.loadAll();

	//starts external API
	require('./routes/manage.js').init(nconf, _applyConfig, server, _applyServer, storage, plugin, share, subkitPackage.version, doc);
	require('./routes/store.js').init(server, storage, doc);
	require('./routes/event.js').init(server, event, doc);
	require('./routes/task.js').init(server, task, doc);

	return {
		getContext: function(){
			return pluginContext;
		}
	};
};
