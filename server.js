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
taskConfig.filesPath = path.join(__dirname, taskConfig.filesPath);
taskConfig.rightsPath = path.join(__dirname, taskConfig.rightsPath);
taskConfig.hooks = hooks;

var s3Config = nconf.get("s3Config");
var schedulerConfig = nconf.get("schedulerConfig");

//init
if(!fs.existsSync(storageConfig.rightsPath))
	fs.writeFileSync(storageConfig.rightsPath, '{"public":[]}');
var	pubsub = require("messaging-module").init({pollInterval: 1});
var storage = require('storage-module').init(storageConfig);
var es = require('./lib/eventsource-module.js').init(storage, pubsub);
var job = require('./lib/task-module.js').init(storageConfig, storage, pubsub);
var task = require('./lib/task-module.js').init(taskConfig, storage, pubsub);

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


//public js sdk
server.get(/subkit[-0-9.a-z]*.js/, restify.serveStatic({
	directory: path.join(__dirname, 'files/jssdk')
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
require("./lib/jobs.js").init(server, job, helper);
require("./lib/pubsub.js").init(server, pubsub, storage, es, helper);
require("./lib/static.js").init(server, staticConfig, helper);
require("./lib/template.js").init(server, templateConfig, helper);
require("./lib/task.js").init(server, storage, taskConfig, task, helper);
require("./lib/statistics.js").init(server, storage, staticConfig, helper);

require("./lib/users.js").init(server, storage, helper);
require("./lib/email.js").init(server, storage, helper);
require("./lib/push.js").init(server, storage, helper);
require("./lib/location.js").init(server, storage, helper);

require("./lib/eventsource.js").init(server, es, helper);
require("./lib/s3.js").init(server, s3Config, helper);

