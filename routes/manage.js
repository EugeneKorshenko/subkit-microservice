'use strict';

var randomString = require('randomstring');
var path = require('path');
var fs = require('fs');
var os = require('os');
var utils = require('../lib/utils.module.js').init();
var shelljs = require('shelljs');

module.exports.init = function(configuration, applyConfiguration, server, applyServer, storage, plugin, share, version, doc){
	require('./doc/manage.doc.js').init(doc);

	server.post('/manage/login', function (req, res, next) {
		var api = configuration.get('api');
		var app = configuration.get('app');
		res.send({ api:api, app:app });
		next();
	});
	server.put('/manage/user', function (req, res, next) {
		var username = req.body.username;
		if(!username) return next(400, new Error('Parameter `username` missing.'));
		
		var adminConfig = configuration.get('admin');
		adminConfig.username = username;

		configuration.set('admin', adminConfig);
		configuration.save(function(err){
			if(err) return next(400, new Error('Can not change username.'));
			applyConfiguration();			
			res.send(202, {message: 'update accepted'});
			next();
		});
	});
	server.put('/manage/apikey/action/reset', function (req, res, next) {
		var apiConfig = configuration.get('api');
		apiConfig.apiKey = randomString.generate(20);

		configuration.set('api', apiConfig);
		configuration.save(function(err){
			if(err) return next(400, new Error('Can not change api-key.'));
			applyConfiguration();
			res.send(202, { message: 'update accepted', apiKey:apiConfig.apiKey });
			next();
		});
	});
	server.put('/manage/password/action/reset', function (req, res, next) {
		if(!req.body) return next(400, new Error('Parameter `password` missing.'));

		var password = req.body.password;
		var newPassword = req.body.newPassword;
		var newPasswordValidation = req.body.newPasswordValidation;

		if(!password) return next(400, new Error('Parameter `password` missing.'));
		if(!newPassword) return next(400, new Error('Parameter `newPassword` missing.'));
		if(!newPasswordValidation) return next(400, new Error('Parameter `newPasswordValidation` missing.'));
		if(newPassword !== newPasswordValidation) return next(400, new Error('New password do not match.'));

		var adminConfig = configuration.get('admin');
		var isValidPassword = utils.validate(adminConfig.password, password);
		if(!isValidPassword) return next(400, new Error('Password do not match.'));
		adminConfig.password = utils.hash(newPassword);

		configuration.set('admin', adminConfig);
		configuration.save(function(err){
			if(err) return next(400, new Error('Can not change the password.'));
			applyConfiguration();
			res.send(202, {message: 'update accepted'});
			next();
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
		next();
	});
	server.put('/manage/certificate/action/change', function (req, res, next) {
		if(!req.body) return next(400, new Error('Parameter `certificate` missing.'));

		var certificate = req.body.certificate;
		var key = req.body.key;
		var ca = req.body.ca;

		if(!certificate) return next(400, new Error('Parameter `certificate` missing.'));
		if(!key) return next(400, new Error('Parameter `key` missing.'));

		var appConfig = configuration.get('app');		
		fs.writeFileSync(appConfig.key, key);
		fs.writeFileSync(appConfig.cert, certificate);
		if(ca) fs.writeFileSync(appConfig.ca, ca);

		configuration.save(function(err){
			if(err) return next(400, new Error('Can not change the certificate.'));
			applyConfiguration();
			res.send(202, {message: 'update accepted'});
			next();
			setTimeout(process.exit, 300);
		});
	});

	server.get('/manage/log/:name', function(req,res,next){
		var name = req.params.name;
		if(!name) return next(400, new Error('Parameter `name` missing.'));

		var fullPath = path.join(process.cwd(),'files/logs', name +'.log.txt');
		fs.readFile(fullPath, function(err, data){
			if(err) return next(400, new Error('Log not found.'));
			res.send(200, data.toString());
			next();
		});
	});
	server.get('/manage/os', function(req, res,next){
		storage.statistics(function(error, data){
			res.send(200, {
				apiVersion: version,
				hostname: os.hostname(),
				dbSize: data || 0,
				processMemUsage: process.memoryUsage().heapTotal,
				processUptime: process.uptime()
			});
			next();
		});
	});
	server.put('/manage/kill', function(req, res,next){
		setTimeout(function(){
			shelljs.exec('kill -9 ' + process.pid);
		}, 100);
		res.send(202, {message: 'Kill accepted'});
		next();
	});	
	server.put('/manage/update', function(req, res,next){
		shelljs.exec('npm install', {silent:false, async:true}, function(error){
			if(error) {
				res.send(400, new Error('Update error.'));
				return next();
			}
			res.send(202, {message: 'Update instance accepted'});
			next();
		});
	});		

	server.post('/manage/import', function(req,res,next){
		var payload = req.body;

		if(req.headers['content-type'] === 'application/octed-stream') {
			try{
				payload = JSON.parse(payload.toString());

			}catch(error){
				return next(400, new Error('Unsupported format.'));
			}
		}
		if(!payload) return next(400, new Error('Unsupported format.'));

		storage.imports('', payload, function(error){
			if(error) return next(400, error);
			res.send(201, { message: 'imported' });
			next();
		});
	});
	server.post('/manage/import/:name', function(req,res,next){
		var name = req.params.name;
		var payload = req.body;
		if(!name) return next(400, new Error('Parameter `name` missing.'));
		if(!payload) return next(400, new Error('Unsupported format.'));

		storage.imports(name, payload, function(error){
			if(error) return next(400, error);
			res.send(201, { message: 'imported' });
			next();
		});
	});
	server.get('/manage/export', function(req,res,next){
		storage.exports('', function(error, data){
			if(error) return next(400, error);

			res.header('Content-Type', 'application/octet-stream');
			res.write(JSON.stringify(data));
			res.end();
			next();
		});
	});
	server.get('/manage/export/:name', function(req,res,next){
		var name = req.params.name;
		if(!name) return next(400, new Error('Parameter `name` missing.'));

		storage.exports(name, function(error, data){
			if(error) return next(400, error);

			res.header('Content-Type', 'application/octet-stream');
			res.write(JSON.stringify(data));
			res.end();
			next();
		});
	});
	server.post('/manage/backup', function(req,res,next){
		storage.backup(function(error, data){
			if(error) { res.send(400, new Error('Backup error')); return next(); }
			res.send(202, data);
			return next();
		});
	});
	server.post('/manage/restore', function(req,res,next){
		var name = req.body.name;
		storage.restore(name, function(error, data){
			if(error) { res.send(400, new Error('Restore error')); return next(); }
			res.send(202, data);
			return next();
		});
	});
	server.del('/manage/db/destroy', function(req,res,next){
		storage.destroy(function(error, data){
			if(error) { res.send(400, new Error('Destroy error')); return next(); }
			res.send(202, data);
			return next();
		});
	});	

	server.get('/manage/plugins', function (req, res, next) {
		plugin.list(function(error, data){
			if(error) return next(400, error);
			res.send(200, data);
			next();
		});
	});
	server.post('/manage/plugins/:name', function (req, res, next) {
		var name = req.params.name;
		
		if(!name) {
			res.send(400, new Error('Parameter `name` missing.'));
			return next();
		}
		if(name.indexOf('subkit-') === -1 || name.indexOf('-plugin') === -1) { 
			res.send(400, new Error('Plugin could not be uninstalled.'));
			return next();
		}

		plugin.add(name, function(error){
			if(error) {
				res.send(400, new Error('Plugin could not be uninstalled.'));
				return next();
			}

			res.send(201, {message: 'Plugin installed'});
			next();
		});
	});
	server.put('/manage/plugins/:name', function (req, res, next) {
		var name = req.params.name;

		if(!name) {
			res.send(400, new Error('Parameter `name` missing.'));
			return next();
		}
		if(name.indexOf('subkit-') === -1 || name.indexOf('-plugin') === -1) { 
			res.send(400, new Error('Plugin could not be uninstalled.'));
			return next();
		}

		plugin.update(name, function(error){
			if(error) {
				res.send(400, new Error('Plugin could not be uninstalled.'));
				return next();
			}

			res.send(202, {message: 'Plugin update accepted'});
			next();
		});
	});
	server.del('/manage/plugins/:name', function (req, res, next) {
		var name = req.params.name;

		if(!name) {
			res.send(400, new Error('Parameter `name` missing.'));
			return next();
		}
		if(name.indexOf('subkit-') === -1 || name.indexOf('-plugin') === -1) { 
			res.send(400, new Error('Plugin could not be uninstalled.'));
			return next();
		}

		plugin.remove(name, function(error){
			if(error) {
				res.send(400, new Error('Plugin could not be uninstalled.'));
				return next();
			}
			res.send(202, {message: 'Plugin uninstall accepted'});
			next();
		});
	});

	server.get('/manage/permissions/identities', function(req, res, next){
		share.listIdentities(function(err, data){
			if(err) return next(400, new Error('Permission error.'));
			res.send(200, data);
			next();
		});
	});
	server.get('/manage/permissions/:identity', function(req, res, next){
		var identity = req.params.identity;
		if(!identity) return next(400, new Error('Parameter `identity` missing.'));

		share.listByIdentity(identity, function(err,data){
			if(err) return next(400, new Error('Permission error.'));
			res.send(200, data);
			next();
		});
	});
	server.post('/manage/permissions/:name', function(req, res, next){
		var name = req.params.name;
		if(!name) return next(400, new Error('Parameter `name` missing.'));

		share.add(name, function(err,data){
			if(err) return next(400, new Error('Permission error.'));
			res.send(201, data);
			next();
		});
	});
	server.del('/manage/permissions/:name', function(req, res, next){
		var name = req.params.name;
		if(!name) return next(400, new Error('Parameter `name` missing.'));

		share.remove(name, function(err){
			if(err) return next(400, new Error('Permission error.'));
			res.send(202, {message: 'delete accepted'});
			next();
		});
	});
	server.put('/manage/permissions/action/revoke/:identity', function(req, res, next){
		var identity = req.params.identity;
		if(!identity) return next(400, new Error('Parameter `identity` missing.'));

		share.revokeAccess(identity, function(err,data){
			if(err) return next(400, new Error('Permission error.'));
			res.send(202, data);
			next();
		});
	});		
	server.put('/manage/permissions/:name/action/grantread/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return next(400, new Error('Parameter `name` missing.'));
		if(!identity) return next(400, new Error('Parameter `identity` missing.'));

		share.grantReadAccess(name,identity,function(err,data){
			if(err) return next(400, new Error('Permission error.'));
			res.send(202, data);
			next();
		});
	});
	server.put('/manage/permissions/:name/action/revokeread/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return next(400, new Error('Parameter `name` missing.'));
		if(!identity) return next(400, new Error('Parameter `identity` missing.'));

		share.revokeReadAccess(name,identity,function(err,data){
			if(err) return next(400, new Error('Permission error.'));
			res.send(202, data);
			next();
		});
	});
	server.put('/manage/permissions/:name/action/grantinsert/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return next(400, new Error('Parameter `name` missing.'));
		if(!identity) return next(400, new Error('Parameter `identity` missing.'));

		share.grantInsertAccess(name,identity, function(err,data){
			if(err) return next(400, new Error('Permission error.'));
			res.send(202, data);
			next();
		});
	});
	server.put('/manage/permissions/:name/action/revokeinsert/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return next(400, new Error('Parameter `name` missing.'));
		if(!identity) return next(400, new Error('Parameter `identity` missing.'));

		share.revokeInsertAccess(name,identity,function(err,data){
			if(err) return next(400, new Error('Permission error.'));
			res.send(202, data);
			next();
		});
	});	
	server.put('/manage/permissions/:name/action/grantupdate/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return next(400, new Error('Parameter `name` missing.'));
		if(!identity) return next(400, new Error('Parameter `identity` missing.'));

		share.grantUpdateAccess(name,identity,function(err,data){
			if(err) return next(400, new Error('Permission error.'));
			res.send(202, data);
			next();
		});
	});	
	server.put('/manage/permissions/:name/action/revokeupdate/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return next(400, new Error('Parameter `name` missing.'));
		if(!identity) return next(400, new Error('Parameter `identity` missing.'));

		share.revokeUpdateAccess(name,identity,function(err,data){
			if(err) return next(400, new Error('Permission error.'));
			res.send(202, data);
			next();
		});
	});
	server.put('/manage/permissions/:name/action/grantdelete/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return next(400, new Error('Parameter `name` missing.'));
		if(!identity) return next(400, new Error('Parameter `identity` missing.'));

		share.grantDeleteAccess(name,identity,function(err,data){
			if(err) return next(400, new Error('Permission error.'));
			res.send(202, data);
			next();
		});
	});
	server.put('/manage/permissions/:name/action/revokedelete/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return next(400, new Error('Parameter `name` missing.'));
		if(!identity) return next(400, new Error('Parameter `identity` missing.'));

		share.revokeDeleteAccess(name,identity,function(err,data){
			if(err) return next(400, new Error('Permission error.'));
			res.send(202, data);
			next();
		});
	});
};
