var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, storage, helper){
	server.get("/users/settings", function(req, res, next){
		res.send(200, {});
	});

	server.get(/users\/(.*)/, function(req, res, next){
		var params = req.params[0].split("/");
		var key = params.join("!");

		storage.read("users", {from: key}, function(err, data){
			if(err) return res.send(500, err);
			res.send(200, data);
		});
	});

	server.post(/users\/(.*)/, function(req, res, next){
		var params = req.params[0].split("/");
		var data = req.body;
		var key = params.join("!");
		
		storage.create("users", key, data, function(err, data){
			if(err) return res.send(500, err);
			res.send(201, { status: "created" });
		});
	});
}