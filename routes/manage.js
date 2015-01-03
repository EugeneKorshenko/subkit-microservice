'use strict';

var uuid = require('node-uuid');
var randomString = require('randomstring');
var	path = require('path');
var	fs = require('fs');
var	os = require('os');
var	utils = require('../lib/utils.module.js').init();

module.exports.init = function(configuration, applyConfiguration, server, applyServer, storage, doc){
	require('./doc/manage.doc.js').init(doc);

	server.post('/manage/login', function (req, res, next) {
		var api = configuration.get('api');
		var app = configuration.get('app');
		res.send({ api:api, app:app });
		return next();
	});
	server.put('/manage/user', function (req, res, next) {
		var username = req.body.username;
		if(!username) return res.send(400, new Error('Parameter `username` missing.'));
		
		var adminConfig = configuration.get('admin');
		adminConfig.username = username;

		configuration.set('admin', adminConfig);
		configuration.save(function(err){
			if(err) return res.send(400, new Error('Can not change username.'));
			applyConfiguration();			
			res.send(202, {message: 'update accepted'});
		});
	});
	server.put('/manage/apikey/action/reset', function (req, res, next) {
		var apiConfig = configuration.get('api');
		apiConfig.apiKey = randomString.generate(20);

		configuration.set('api', apiConfig);
		configuration.save(function(err){
			if(err) return res.send(400, new Error('Can not change api-key.'));
			applyConfiguration();
			res.send(202, { message: 'update accepted', apiKey:apiConfig.apiKey });
		});
	});
	server.put('/manage/password/action/reset', function (req, res, next) {
		if(!req.body) return res.send(400, new Error('Parameter `password` missing.'));

		var password = req.body.password;
		var newPassword = req.body.newPassword;
		var newPasswordValidation = req.body.newPasswordValidation;

		if(!password) return res.send(400, new Error('Parameter `password` missing.'));
		if(!newPassword) return res.send(400, new Error('Parameter `newPassword` missing.'));
		if(!newPasswordValidation) return res.send(400, new Error('Parameter `newPasswordValidation` missing.'));
		if(newPassword !== newPasswordValidation) return res.send(400, new Error('New password do not match.'));

		var adminConfig = configuration.get('admin');
		var isValidPassword = utils.validate(adminConfig.password, password);
		if(!isValidPassword) return res.send(400, new Error('Password do not match.'));
		adminConfig.password = utils.hash(newPassword);

		configuration.set('admin', adminConfig);
		configuration.save(function(err){
			if(err) return res.send(400, new Error('Can not change the password.'));
			applyConfiguration();
			res.send(202, {message: 'update accepted'});
		});
	});
	server.get('/manage/certificate', function (req, res, next) {
		var appConfig = configuration.get('app');
		if(!appConfig.cert) return res.send(200,{certificate:'',key:'' });
		if(!appConfig.key) return res.send(200,{certificate:'',key:'' });

		var cert = fs.readFileSync(path.join(process.cwd(), appConfig.cert)).toString();
		var key = fs.readFileSync(path.join(process.cwd(), appConfig.key)).toString();
		res.send(200, {
			certificate: cert,
			key: key
		});
	});
	server.put('/manage/certificate/action/change', function (req, res, next) {
		if(!req.body) return res.send(400, new Error('Parameter `certificate` missing.'));

		var certificate = req.body.certificate;
		var key = req.body.key;
		var ca = req.body.ca;

		if(!certificate) return res.send(400, new Error('Parameter `certificate` missing.'));
		if(!key) return res.send(400, new Error('Parameter `key` missing.'));
		if(!ca) return res.send(400, new Error('Parameter `ca` missing.'));

		var appConfig = configuration.get('app');		
		fs.writeFileSync(appConfig.key, key);
		fs.writeFileSync(appConfig.cert, certificate);
		fs.writeFileSync(appConfig.ca, ca);

		configuration.save(function(err){
			if(err) return res.send(400, new Error('Can not change the certificate.'));
			applyConfiguration();
			res.send(202, {message: 'update accepted'});
			setTimeout(process.exit, 300);
		});
	});

	server.get('/manage/log/:name', function(req,res,next){
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));

		var fullPath = path.join(process.cwd(),'files/logs', name +'.log.txt');
		fs.readFile(fullPath, function(err, data){
			if(err) return res.send(400, new Error('Log not found.'));
			res.send(200, data.toString());
		});
	});
	server.get('/manage/os', function(req, res,next){
		res.send(200, {
			hostname: os.hostname(),
			osType: os.type(),
			osPlatform: os.platform(),
			osArch: os.arch(),
			osRelease: os.release(),
			osUptime: os.uptime(),
			osCpus: os.cpus(),
			osTotalMem: os.totalmem(),
			osLoadAvg: os.loadavg(),
			osFreeMem: os.freemem(),
			processMemUsage: process.memoryUsage(),
			processUptime: process.uptime()
		});
	});

	server.post('/manage/import', function(req,res,next){
		var payload = req.body;
		if(!payload) return res.send(400, new Error('Unsupported format.'));

		storage.imports('', payload, function(error, data){
			if(error) return res.send(500, error);
			res.send(201, { message: 'imported' });
		});
	});
	server.post('/manage/import/:name', function(req,res,next){
		var name = req.params.name;
		var payload = req.body;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));
		if(!payload) return res.send(400, new Error('Unsupported format.'));

		storage.imports(name, payload, function(error, data){
			if(error) return res.send(500, error);
			res.send(201, { message: 'imported' });
		});
	});
	server.get('/manage/export', function(req,res,next){
		storage.exports('', function(error, data){
			if(error) return res.send(500, error);

			res.header('Content-Type', 'application/octet-stream');
			res.write(JSON.stringify(data));
			res.end();
		});
	});
	server.get('/manage/export/:name', function(req,res,next){
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));

		storage.exports(name, function(error, data){
			if(error) return res.send(500, error);

			res.header('Content-Type', 'application/octet-stream');
			res.write(JSON.stringify(data));
			res.end();
		});
	});
	server.post('/manage/backup', function(req,res,next){
		storage.backup(function(error, data){
			if(error) return next(error);
			res.send(202, data);
			return next();
		});
	});
	server.post('/manage/restore', function(req,res,next){
		var name = req.body.name;
		storage.restore(name, function(error, data){
			if(error) return next(error);
			res.send(202, data);
			return next();
		});
	});
};