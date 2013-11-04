var helper = require("./helper.js");

module.exports.init = function(server){
	//storage
	server.get("/stores", helper.apiAuth, function (req, res, next) {
		storage.stores(function(error, resourceKeys){
			if(error) return next(error);
			res.send(resourceKeys);
			return next();
		});
	});
	server.post("/store/:name/grant", helper.userAuth, helper.setNewETag, function (req, res, next) {
		var storeName = req.params.name;
		if(!storeName) return res.send(404, new Error("Parameters not set."));
		
		storage.setPublic(storeName, function(error, data){
			if(error) return next(error);
			res.send(201, data);
			return next();
		});
	});
	server.del("/store/:name/grant", helper.userAuth, helper.setNewETag, function (req, res, next) {
		var storeName = req.params.name;
		if(!storeName) return res.send(404, new Error("Parameters not set."));

		storage.setPrivate(storeName, function(error, data){
			if(error) return next(error);
			res.send(202, data);
			return next();		
		});
	});
	server.get(/store\/([a-zA-Z0-9_\.~-]+)(\/)?(.*)/, helper.apiAuth, function (req, res, next) {
		var resource = req.params[0]
			,key = req.params[2]
			,from = req.params.from
			,limit = req.params.limit
			,keysOnly = req.params.keysOnly
			,cache = req.params.cache;

		if(resource === "") return res.send(404, new Error("Parameters not set."));

		var options = {
			cache: true
		};
		if(cache) options.cache = cache==="false" ? false : true;
		if(key) options.key = key;
		if(limit) options.limit = parseInt(limit);
		if(from) options.from = from;
		if(keysOnly) options.keysOnly = keysOnly==="false" ? false : true;

		storage.read(resource, options, function(error, data){
			if(error) return next(error);
			res.send(data);
			return next();
		});
	});
	server.post(/store\/([a-zA-Z0-9_\.~-]+)\/(.*)/, helper.apiAuth, helper.setNewETag, function (req, res, next) {
		var resource = req.params[0]
			,key = req.params[1]
			,payload = req.body;

		if(resource === "" || key === "" || payload === undefined) return res.send(404, new Error("Parameters not set."));

		storage.create(resource, key, payload, function(error){
			if(error) return next(error);
			res.send(201, { status: "created" });
			return next();
		});
	});
	server.put(/store\/([a-zA-Z0-9_\.~-]+)\/(.*)/, helper.apiAuth,helper.setNewETag, function (req, res, next) {
		var resource = req.params[0]
			,key = req.params[1]
			,payload = req.body;

		if(resource === "" || key === ""  || payload === undefined) return res.send(404, new Error("Parameters not set."));

		storage.update(resource, key, payload, function(error){
			if(error) return next(error);
			res.send(202, { status: "created" });
			return next();
		});
	});
	server.del(/store\/([a-zA-Z0-9_\.~-]+)\/(.*)/, helper.apiAuth, helper.setNewETag, function (req, res, next) {
		var resource = req.params[0]
			,key = req.params[1];

		if(resource === "" || key === "") return res.send(404, new Error("Parameters not set."));

		storage.del(resource, key, function(error){
			if(error) return next(error);
			res.send(202, { status: "accepted" });
			return next();
		});
	});
}