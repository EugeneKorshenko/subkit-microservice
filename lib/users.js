var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, storage, helper){
	server.get("/users/settings", function(req, res, next){
		res.send(200, {});
	});

	server.get(/query\/users\/(.*)/, function(req, res, next){
		var params = req.params[0].split("/");
		var key = params.join("!") + "!";
		var keysOnly = req.params.keysOnly

		storage.read("users", {from: key, keysOnly: keysOnly}, function(err, data){
			if(err) return res.send(500, err);
			res.send(200, data);
		});
	});

	server.get(/users\/(.*)/, function(req, res, next){
		var key = req.params[0].replace("/", "!");
		var keysOnly = req.params.keysOnly

		storage.read("users", {key: key}, function(err, data){
			if(err) return res.send(500, err);
			res.send(200, data);
		});
	});
	server.get("/users", function(req, res, next){
		var keysOnly = req.params.keysOnly
		storage.read("users", {keysOnly: keysOnly}, function(err, data){
			if(err) return res.send(500, err);
			res.send(200, data);
		});
	});

	server.post(/users\/(.*)/, function(req, res, next){
		var key = req.params[0].replace("/", "!");
		var data = req.body;
		
		storage.create("users", key, data, function(err, data){
			if(err) return res.send(500, err);
			res.send(201, { status: "created" });
		});
	});

	server.put(/users\/(.*)/, function(req, res, next){
		var key = req.params[0].replace("/", "!");
		var data = req.body;
		
		storage.update("users", key, data, function(err, data){
			if(err) return res.send(500, err);
			res.send(200, { status: "updated" });
		});
	});

	server.del(/users\/(.*)/, function(req, res, next){
		var key = req.params[0].replace("/", "!");
		
		storage.del("users", key, function(err, data){
			if(err) return res.send(500, err);
			res.send(202, { status: "accepted" });
		});
	});
}