'use strict';

var uuid = require('node-uuid'),
	path = require('path'),
	fs = require('fs'),
	utils = require('./helper.js').init(),
	os = require('os');

module.exports.init = function(configuration, applyConfiguration, server, applyServer, storage, doc){
	var manage_doc = doc('manage', 'Service instance operations.');
	manage_doc.models.PasswordChange = {
		id: 'PasswordChange',
		properties: {
			password:{
				type: 'string'
			},
			newPassword:{
				type: 'string'
			},
			newPasswordValidation:{
				type: 'string'
			}
		}
	};
	manage_doc.models.Certificate = {
		id: 'Certificate',
		properties: {
			certificate:{
				type: 'string'
			},
			key:{
				type: 'string'
			}
		}
	};
	manage_doc.post('/manage/login','Signin.',{
		nickname: 'Login',
	    summary: 'Validate username and password.',
	    errorResponses:[
			{
				code: 401,
				message: 'Unauthorized request.'
			}
		]
	});
	manage_doc.put('/manage/password/actions/reset','Reset admin password.',{
		nickname: 'changePassword',
		parameters: [
			{name: 'PasswordChange', description: 'Password change object.', required:true, dataType: 'PasswordChange', paramType: 'body'}
		],
	    errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/apikey/actions/reset','Change API key.',{
		nickname: 'changeAPIKey',
	    errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/certificate/actions/change','Change instance certificate.',{
		nickname: 'changeCertificate',
		parameters: [
			{name: 'Certificate', description: 'Password change object.', required:true, dataType: 'Certificate', paramType: 'body'}
		],
	    errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.get('/manage/os','OS information.',{
		nickname: 'getOSInformation',
	    errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.get('/manage/log/{name}','Read logging and tracing information.',{
		nickname: 'getLogByName',
		responseClass: 'List[Value]',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X GET {BASEURI}/manage/log/{name}',
		parameters: [
	    	{name: 'name', description: 'Name of log (err, out).', required:true, dataType: 'string', paramType: 'path'}
	    ],
	    errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});

	server.post('/manage/login', function (req, res, next) {
		var api = configuration.get('api');
		var app = configuration.get('app');
		res.send({ api:api, app:app });
		return next();
	});
	server.put('/manage/user', function (req, res, next) {
		var username = req.body.username;
		if(!username) return res.send(400, new Error('Parameter `username` not set.'));
		
		var adminConfig = configuration.get('admin');
		adminConfig.username = username;
		configuration.set('admin', adminConfig);
		configuration.save(function(err){
			if(err) return res.send(400, new Error('Can not change the user name.'));
			applyConfiguration();
			res.send(202, {
				username: adminConfig.username
			});
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
	server.put('/manage/apikey/actions/reset', function (req, res, next) {
		var apiConfig = configuration.get('api');
		apiConfig.apiKey = uuid.v4();
		configuration.set('api', apiConfig);
		configuration.save(function(err){
			if(err) return res.send(400, new Error('Can not change the api key.'));
			applyConfiguration();
			res.send(202, {
				api:apiConfig
			});
		});
	});
	server.put('/manage/password/actions/reset', function (req, res, next) {
		var password = req.body.password;
		var newPassword = req.body.newPassword;
		var newPasswordValidation = req.body.newPasswordValidation;

		if(!password) return res.send(400, new Error('Parameter `password` not set.'));
		if(!newPassword) return res.send(400, new Error('Parameter `newPassword` not set.'));
		if(!newPasswordValidation) return res.send(400, new Error('Parameter `newPasswordValidation` not set.'));
		if(newPassword !== newPasswordValidation) return res.send(400, new Error('New password do not match.'));

		var adminConfig = configuration.get('admin');
		var isValidPassword = utils.validate(adminConfig.password, password);
		if(!isValidPassword) return res.send(400, new Error('Password do not match.'));
		adminConfig.password = utils.hash(newPassword);
		configuration.set('admin', adminConfig);
		configuration.save(function(err){
			if(err) return res.send(400, new Error('Can not change the password.'));
			applyConfiguration();
			res.send(202, {message: 'changed'});
		});
	});
	server.get('/manage/certificate', function (req, res, next) {
		var appConfig = configuration.get('app');
		var cert = fs.readFileSync(path.join(__dirname,'..', appConfig.cert)).toString();
		var key = fs.readFileSync(path.join(__dirname,'..', appConfig.key)).toString();
		res.send(200, {
			certificate: cert,
			key: key
		});
	});
	server.put('/manage/certificate/actions/change', function (req, res, next) {
		var certificate = req.body.certificate;
		var key = req.body.key;
		if(!certificate) return res.send(400, new Error('Parameter `certificate` not set.'));
		if(!key) return res.send(400, new Error('Parameter `key` not set.'));
		var appConfig = configuration.get('app');
		
		fs.writeFileSync(appConfig.key, key);
		fs.writeFileSync(appConfig.cert, certificate);

		configuration.save(function(err){
			if(err) return res.send(400, new Error('Can not change the certificate.'));
			applyConfiguration();
			res.send(202, {message: 'changed'});
			setTimeout(process.exit,300);
		});
	});
	server.post('/manage/import', function(req,res,next){
		var payload = req.body;
		storage.imports('', JSON.parse(payload.toString()), function(error, data){
			if(error) return res.send(500, error);
			res.send(201, { message: 'imported' });
		});
	});
	server.post('/manage/import/:name', function(req,res,next){
		var name = req.params.name;
		var payload = req.body;
		if(!name) return res.send(400, new Error('Parameter `name` not set.'));
		
		storage.imports(name, JSON.parse(payload.toString()), function(error, data){
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
		if(!name) return res.send(400, new Error('Parameter `name` not set.'));

		storage.exports(name, function(error, data){
			if(error) return res.send(500, error);

			res.header('Content-Type', 'application/octet-stream');
			res.write(JSON.stringify(data));
			res.end();
		});
	});
	server.get('/manage/log/:name', function(req,res,next){
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Parameter `name` not set.'));

		var fullPath = path.join(__dirname,'../files/logs', name +'.log.txt');
		fs.readFile(fullPath, function(err, data){
			if(err) return res.send(400, new Error('Log not found.'));
			res.send(200, data.toString());
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