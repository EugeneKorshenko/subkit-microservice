var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, storage, helper){
	server.get("/users/settings", function(req, res, next){
		res.send(200, {});
	});

	server.get(/users\/validate\/(.*)/, function(req, res, next){
		var key = req.params[0].replace(/\//g, "!");
		
		storage.read("users", {key: key}, function(err, user){
			if(err) return res.send(500, err);
			user = JSON.parse(user);

			var validated = false;

			validated = (user.username && req.username && user.username === req.username) ? true : false;
			validated = (user.password && req.authorization && req.authorization.basic && req.authorization.basic.password && user.password === req.authorization.basic.password) ? true : false;
			
			if(!validated) return res.send(401);
			res.send(200, user);
		});
	});

	server.get(/users\/(.*)/, function(req, res, next){
		var key = req.params[0].replace(/\//g, "!");
		var keysOnly = req.params.keysOnly;

		storage.read("users", {key: key}, function(err, data){
			if(data == undefined) {
				key += "!";
				storage.read("users", {from: key, keysOnly: keysOnly}, function(err, data){
					if(err) return res.send(500, err);
					return res.send(200, data);
				});
			}else{
				if(err) return res.send(500, err);
				res.send(200, data);
			}
		});
	});
	
	server.get("/users", function(req, res, next){
		var keysOnly = req.params.keysOnly;
		storage.read("users", {keysOnly: keysOnly}, function(err, data){
			if(err) return res.send(500, err);
			res.send(200, data);
		});
	});

	server.post(/users\/(.*)/, function(req, res, next){
		var key = req.params[0].replace(/\//g, "!");
		var user = req.body;
		storage.read("users", {key: key}, function(err, data){
			if(data != undefined) return res.send(406, new Error("user exists"));

			storage.create("users", key, user, function(err, data){
				if(err) return res.send(500, err);
				res.send(201, { status: "created" });
			});
		});
	});

	server.put(/users\/(.*)/, function(req, res, next){
		var key = req.params[0].replace(/\//g, "!");
		var data = req.body;
		
		storage.update("users", key, data, function(err, data){
			if(err) return res.send(500, err);
			res.send(200, { status: "updated" });
		});
	});

	server.del(/users\/(.*)/, function(req, res, next){
		var key = req.params[0].replace(/\//g, "!");
		
		storage.del("users", key, function(err, data){
			if(err) return res.send(500, err);
			res.send(202, { status: "accepted" });
		});
	});
}