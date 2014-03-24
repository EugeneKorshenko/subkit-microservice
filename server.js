'use strict';
var restify = require('restify'),
	http = require('http'),
	fs = require('fs'),
	path = require("path"),
	nconf = require('nconf'),
	_ = require('underscore'),
	uuid = require("node-uuid"),
	crypto = require("crypto");

//config
nconf
	.argv()
	.env()
	.file('config', path.join(__dirname, 'config.json'))
  	.file('defaults', path.join(__dirname, 'defaults.json'));

var admin = nconf.get("admin"),
	app = nconf.get("app"),
	api = nconf.get("api"),
	etag = null,
	lastModified = null;


//correct root path
var storageConfig = nconf.get("storageConfig");
var hooks = nconf.get("hooks");
storageConfig.dbPath = path.join(__dirname, storageConfig.dbPath);
storageConfig.rightsPath = path.join(__dirname, storageConfig.rightsPath);
storageConfig.filesPath = path.join(__dirname, storageConfig.filesPath);
storageConfig.hooks = hooks;

var staticConfig = nconf.get("staticConfig");
staticConfig.filesPath = path.join(__dirname, staticConfig.filesPath);
staticConfig.rightsPath = path.join(__dirname, staticConfig.rightsPath);
staticConfig.hooks = hooks;

var templateConfig = nconf.get("templateConfig");
templateConfig.filesPath = path.join(__dirname, templateConfig.filesPath);
templateConfig.rightsPath = path.join(__dirname, templateConfig.rightsPath);
templateConfig.hooks = hooks;
templateConfig.templateData = {
	url: api.url,
	apiKey: api.apiKey,
	username: admin.username,
	password: admin.password
};

var taskConfig = nconf.get("taskConfig");
taskConfig.pluginsPath = path.join(__dirname, taskConfig.pluginsPath);
taskConfig.jobsPath = path.join(__dirname, taskConfig.jobsPath);
taskConfig.mapreducePath = path.join(__dirname, taskConfig.mapreducePath);
taskConfig.rightsPath = path.join(__dirname, taskConfig.rightsPath);
taskConfig.hooks = hooks;

var emailConfig = nconf.get("emailConfig");
var pushConfig = nconf.get("pushConfig");
pushConfig.APN_Sandbox_Pfx = path.join(__dirname, pushConfig.APN_Sandbox_Pfx);
pushConfig.APN_Pfx = pushConfig.APN_Pfx ? path.join(__dirname, pushConfig.APN_Pfx) : "";
pushConfig.MPNS_Pfx = (pushConfig.MPNS_Pfx && fs.existsSync(path.join(__dirname, pushConfig.MPNS_Pfx))) ? path.join(__dirname, pushConfig.MPNS_Pfx) : "";

var s3Config = nconf.get("s3Config");
var schedulerConfig = nconf.get("schedulerConfig");

//init
if(!fs.existsSync(storageConfig.rightsPath))
	fs.writeFileSync(storageConfig.rightsPath, '{"public":[]}');

var	pubsub = require("./lib/pubsub-module.js").init({pollInterval: 1});
var storage = require('./lib/store-module.js').init(storageConfig);
var es = require('./lib/eventsource-module.js').init(storage, pubsub);
var identity = require('./lib/identity-module.js').init(storage);

var renderer = require("./lib/template-module.js").init({templatesPath: templateConfig.filesPath});
var email = require("./lib/email-module.js").init(emailConfig, renderer, identity);
var push = require('./lib/push-module.js').init(pushConfig, storage);
var task = require('./lib/task-module.js').init(taskConfig, storage, pubsub, email, push, es);
var location = require('./lib/location-module.js').init(storage);


var options = { name: "SubKit" };

//configure HTTPS/SSL
if(app.key) options.key = fs.readFileSync(app.key);
if(app.cert) options.certificate = fs.readFileSync(app.cert);
var	server = restify.createServer(options);

//conf reload
var reloadConf = function(curr, prev){
	nconf.file('config', path.join(__dirname, 'config.json'));
  	nconf.file('defaults', path.join(__dirname, 'defaults.json'));
	admin = nconf.get("admin");
	app = nconf.get("app");
	api = nconf.get("api");
	hooks = nconf.get("hooks");
}
fs.watchFile(path.join(__dirname, "config.json"), reloadConf);
fs.watchFile(path.join(__dirname, "defaults.json"), reloadConf);

//server middleware
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
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, HEAD, OPTION");
	res.header("Access-Control-Allow-Headers", "Authorization, Content-Type, api_key, apikey, X-Requested-With");
	res.send(200);
	return next();
});

//handle errors
// server.on("uncaughtException", function (req, res, route, err) {
// 	console.log("A uncought exception was thrown: " + route + " -> " + err.message);
// 	res.send(500, err.message);
// });
// process.on('uncaughtException', function(err){
// 	console.log("A uncought exception was thrown: " + err.message);
// });

//js sdk
server.get(/\/sdk\/?.*/, restify.serveStatic({
	directory: path.join(__dirname, 'files/jssdk') 
}));

//public console
var rendererDevCenter = require("./lib/template-module.js").init({
	templatesPath: path.join(__dirname, 'files/mobile')
});
server.get("/doc", function(req, res, next){

	var consoleData = {
	  url: api.url,
	  apiKey: api.apiKey,
	  username: admin.username,
	  password: admin.password
	};
	rendererDevCenter.render("doc", consoleData, function(err, html){
	  res.contentType = 'text/html';
	  res.write(html);
	  res.end();
	});
});

//development center
var rendererMobileCenter = require("./lib/template-module.js").init({
	templatesPath: path.join(__dirname, 'files/mobile')
});
server.get("/", function(req, res, next){
	var consoleData = {
	  url: api.url,
	  apiKey: api.apiKey,
	  username: admin.username,
	  password: admin.password
	};
	rendererMobileCenter.render("index", consoleData, function(err, html){
	  res.contentType = 'text/html';
	  res.write(html);
	  res.end();
	});
});

server.get(/\/dashboard\/?.*/, restify.serveStatic({
  directory: path.join(__dirname, 'files/mobile')
}));

//start web server
server.listen(app.port, function(){
	console.log("subkit lite service listen on: " + server.address().port);
	console.log(process.pid);
	http.globalAgent.maxSockets = 50000;
});

var helper = require("./lib/helper.js").init(admin, api, etag, lastModified, storage);
helper.setNewETag();

//JSON doc
require('./doc').configure(server, {
	discoveryUrl: "/docs",
	version:      "1.2",
	basePath:     api.url
});

require("./lib/manage.js").init(nconf, api, app, server, storage, helper);
require("./lib/store.js").init(server, storage, helper);
require("./lib/pubsub.js").init(server, pubsub, helper);
require("./lib/static.js").init(server, staticConfig, helper);
require("./lib/template.js").init(server, templateConfig, renderer, helper);
require("./lib/plugin.js").init(server, storage, taskConfig, task, helper);
require("./lib/statistics.js").init(server, storage, staticConfig, pubsub, helper);

require("./lib/identity.js").init(server, storage, identity, helper);
require("./lib/email.js").init(server, emailConfig, task, helper);
require("./lib/push.js").init(server, nconf, pushConfig, push,identity, helper);
require("./lib/location.js").init(server, storage, helper);

require("./lib/eventsource.js").init(server, es, helper);
require("./lib/s3.js").init(server, s3Config, helper);

