var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, storage, helper){
	server.get("/users/settings", function(req, res, next){
		res.send(200, {});
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
		
		storage.create("users", key, req.body, function(err, data){
			if(err) return res.send(500, err);
			res.send(201, { status: "created" });
		});
	});

	server.put(/users\/(.*)/, function(req, res, next){
		var key = req.params[0].replace(/\//g, "!");

		storage.read("users", {}, function(err, data){
			if(err) return res.send(500, err);
			
			var ops = data.filter(function(itm){
				var itmKey = itm.key.split("!").pop();
				return itmKey === key;
			}).map(function(itm){
				return {
					type: 'put',
					key: "users" + "!" + itm.key,
					value: req.body
				}
			});

			storage.batch(ops, function(err, data){
				if(err) return res.send(500, err);
				res.send(200, { status: "updated" });
			});
		});
	});

	server.del(/users\/(.*)/, function(req, res, next){
		var key = req.params[0].replace(/\//g, "!");
		storage.read("users", {}, function(err, data){
			if(err) return res.send(500, err);
			
			var ops = data.filter(function(itm){
				var itmKey = itm.key.split("!").pop();
				return itmKey === key;
			}).map(function(itm){
				return {
					type: 'del',
					key: "users" + "!" + itm.key,
					value: req.body
				}
			});
			
			storage.batch(ops, function(err, data){
				if(err) return res.send(500, err);
				res.send(200, { status: "deleted" });
			});
		});
	});

}