'use strict';

var restify = require('restify');
var fs = require('fs');
var path = require('path');
var nconf = require('nconf');
var subkitPackage = require('./package.json');
var logger = require('./lib/logger.module.js').init();
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
			nconf.set('admin', JSON.parse(JSON.stringify(admin)));
			nconf.set('app', JSON.parse(JSON.stringify(app)));
			nconf.set('api', JSON.parse(JSON.stringify(api)));
			nconf.set('paths', JSON.parse(JSON.stringify(paths)));
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
			logger.log('Subkit micro-service (V'+subkitPackage.version+') listen.');
			logger.log('ENVIRONMENT: '+process.env.NODE_ENV);
			logger.log('SECURE: '+srv.secure);
			logger.log('PORT: '+srv.address().port);
			logger.log('PID: '+process.pid);
		});
		return srv;	
	};
	var server = _applyServer();
	server.formatters['text/html'] = require('restify-formatter-text');
	server.acceptable.push('text/html');

	//middleware
	server.pre(restify.pre.sanitizePath());
	server.pre(restify.pre.userAgentConnection());
	server.use(restify.fullResponse());
	server.use(restify.CORS({
		origins: ['*'],
		credentials: true,
		headers: ['authorization','content-type','x-auth-token','x-subkit-event-persistent', 'x-subkit-event-metadata', 'x-subkit-event-webhook','x-subkit-event-filter','x-subkit-event-apikey']
	}));	
	server.use(restify.authorizationParser());
	server.use(restify.bodyParser({ mapParams: true }));
	server.use(restify.queryParser());
	server.use(restify.throttle({ burst: 100, rate: 900, ip: true }));

	//handle CORS
	server.opts(/\.*/, function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, HEAD, OPTION');
		res.header('Access-Control-Allow-Headers', 'authorization, content-type, x-auth-token, x-subkit-event-persistent, x-subkit-event-metadata, x-subkit-event-webhook, x-subkit-event-filter, x-subkit-event-apikey');
		res.send(200);
		return next();
	});
	
	//modules
	var storage = require('./lib/store.module.js').init(paths, logger);
	var	event = require('./lib/event.module.js').init({}, storage, logger);
	var share = require('./lib/share.module.js').init({}, logger);
	var file = require('./lib/file.module.js');
	var es = require('./lib/eventsource.module.js').init(storage, event);
	var template = require('./lib/template.module.js');
	var task = require('./lib/task.module.js').init(paths, storage, event, es, template.init(paths, logger), file.init(paths, logger), logger);
	var identity = require('./lib/identity.module.js');

    //handle access
    var usersIdent = identity.init(null, storage, logger);	
	server.use(function(req, res, next){
		var apikey = req.headers['x-auth-token'] || req.params.apikey || req.params.api_key;
		var token = null;

		if(api.apiKey === apikey) {
			logger.log('authorized', {apikey: apikey });
			return next();
		}
		if((req.authorization)
			&& (req.authorization.basic)
			&& (req.username === admin.username)
			&& (utils.validate(admin.password, req.authorization.basic.password))){
			logger.log('authorized', { username: req.username || 'none'});
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
						logger.log('authorized', {apikey: apikey || 'none', token: token || 'none', username: username || 'none'});
						return next();
					}
					
					if(user && user.groups){
						for (var p = 0; p < user.groups.length; p++) {
							var group = user.groups[p];
							if(shareItem[req.method].indexOf(group) !== -1){
								logger.log('authorized', {apikey: apikey || 'none', token: token || 'none', username: username || 'none'});
								return next();
							}
						}
					}
				}
			}
			logger.log('Unauthorized', {apikey: apikey || 'none', token: token || 'none'});
			res.send(401, new Error('Unauthorized'));
		});
	});
	
	//handle message streams
	require('./routes/event.js').init(server, event, logger, nconf);
	
	//starts the tasks scheduler
	task.runScheduler(true);

	//plugins
	var pluginContext = {
		plugins: subkitPackage.optionalDependencies,
		server: server,
		configuration: nconf,
		util: utils,
		storage: storage,
		permission: share,
		event: event,
		eventSource: es,
		file: file,
		template: template,
		task: task,
		identity: identity,
		logger: logger,
		serve: restify.serveStatic
	};

	var plugin = require('./lib/plugin.module.js').init(pluginContext, logger);
	plugin.loadAll();

	//middleware	
	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.dateParser());
	server.use(restify.gzipResponse());	

	//starts external API
	require('./routes/manage.js').init(nconf, _applyConfig, server, _applyServer, storage, plugin, share, logger, subkitPackage.version);
	require('./routes/store.js').init(server, storage);
	require('./routes/task.js').init(server, task);

	return {
		getContext: function(){
			return pluginContext;
		}
	};
};
