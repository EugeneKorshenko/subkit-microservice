'use strict';

var uuid = require("node-uuid");

module.exports.init = function(nconf, api, app, server, storage, helper, doc){
	var manage_doc = doc("manage", "Service instance management operations.");
	manage_doc.post("/manage/login","Login with username and password.",{
		nickname: "Login",
	    summary: "Validate username and password.",
	    errorResponses:[
			{
				code: 401,
				message: "Unauthorized request."
			}
		]
	});
	manage_doc.put("/manage/change","Change API key.",{
		nickname: "ChangeAPIKey",
	    summary: "Change the current API key to a new uuid.",
	    errorResponses:[
			{
				code: 401,
				message: "Unauthorized request."
			}
		]
	});

	server.post("/manage/login", helper.userAuth, function (req, res, next) {
		res.send({ api:api, app:app });
		return next();
	});
	server.put("/manage/change", helper.userAuth, function (req, res, next) {
		api.apiKey = uuid.v4();
		nconf.set('api', api);
		nconf.save(function(err){
			if(err) return next(err);
			res.send({api:api, app:app});
			return next();
		});
	});
	server.del("/manage/destroy", helper.userAuth, function(req,res,next){
		storage.destroy(function(error){
			if(error) return next(error);
			res.send(202);
			return next();
		});
	});
	server.post("/manage/import", helper.userAuth, helper.setNewETag, function(req,res,next){
		var payload = req.body;
		storage.imports("", payload, function(error, data){
			if(error) return next(error);
			res.send(201, data);
			return next();
		});
	});
	server.post("/manage/import/:name", helper.userAuth, helper.setNewETag, function(req,res,next){
		var storeName = req.params.name,
			payload = req.body;
		storage.imports(storeName, payload, function(error, data){
			if(error) return next(error);
			res.send(201, data);
			return next();
		});
	});
	server.get("/manage/export", helper.userAuth, function(req,res,next){
		storage.exports("", function(error, data){
			if(error) return next(error);
			res.send(200, data);
			return next();
		});
		return next();
	});
	server.get("/manage/export/:name", helper.userAuth, function(req,res,next){
		var storeName = req.params.name;
		storage.exports(storeName, function(error, data){
			if(error) return next(error);
			res.send(200, data);
			return next();
		});
		return next();
	});
	server.post("/manage/backup", helper.userAuth, function(req,res,next){
		storage.backup(function(error, data){
			if(error) return next(error);
			res.send(202, data);
			return next();
		});
	});
	server.post("/manage/restore", helper.userAuth, function(req,res,next){
		var name = req.body.name;
		storage.restore(name, function(error, data){
			if(error) return next(error);
			res.send(202, data);
			return next();
		});
	});
};