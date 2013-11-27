var randString = require("randomstring");

module.exports.init = function(server, storage, helper){
	server.get("/users/settings", function(req, res, next){
		res.send(200, {});
	});

	server.get("/users/groups", function(req, res, next){
		storage.read("users", {}, function(err, data){
			if(err) return res.send(500, err);
			var groups = data.reduce(function(state, event){
				var userGroups = event.value.groups || [];
				userGroups.forEach(function(group){
					state[group] = [];
				});
				return state;
			}, {});
			var result = [];
			for(var group in groups){
				result.push(group);
			}
			res.send(200, result);
		});		
	});

	server.get("/users/groups/users", function(req, res, next){
		storage.read("users", {}, function(err, data){
			if(err) return res.send(500, err);
			var groups = data.reduce(function(state, event){
				var userGroups = event.value.groups || [];
				userGroups.forEach(function(group){
					if(!state[group]) state[group] = [];
					state[group].push(event);
				});
				return state;
			}, {});
			res.send(200, groups);
		});		
	});

	server.get("/users/:groupId", function(req, res, next){
		var groupId = req.params.groupId;

		storage.read("users", {}, function(err, data){
			if(err) return res.send(500, err);
			var groups = data.reduce(function(state, event){
				var userGroups = event.value.groups || [];
				userGroups.filter(function(itm){
					return itm === groupId;
				}).forEach(function(group){
					if(!state[group]) state[group] = [];
					state[group].push(event);
				});
				return state;
			}, {});
			res.send(200, groups[groupId] || []);
		});		
	});

	server.post("/users/groups/:groupId/:userId", function(req, res, next){
		var userId = req.params.userId;
		var groupId = req.params.groupId;

		storage.read("users", {key: userId}, function(err, user){
			if(err) return res.send(500, err);
			if(!user.groups) user.groups = [];
			user.groups.push(groupId);
			storage.update("users", userId, user, function(err, data){
				if(err) return res.send(500, err);
				res.send(202, { status: "added" });
			});
		});
	});

	server.del("/users/groups/:groupId/:userId", function(req, res, next){
		var userId = req.params.userId;
		var groupId = req.params.groupId;

		storage.read("users", {key: userId}, function(err, user){
			if(err) return res.send(500, err);
			if(!user.groups) user.groups = [];
			
			var index = user.groups.indexOf(groupId);
			user.groups.splice(index, 1);

			storage.update("users", userId, user, function(err, data){
				if(err) return res.send(500, err);
				res.send(202, { status: "removed" });
			});
		});
	});
	

	server.get("users/validate/:userid", function(req, res, next){
		var userId = req.params.userid;
		
		storage.read("users", {key: userId}, function(err, user){
			if(err) return res.send(500, err);
			user = JSON.parse(user);

			var validated = false;

			validated = (user.username && req.username && user.username === req.username) ? true : false;
			validated = (user.password && req.authorization && req.authorization.basic && req.authorization.basic.password && user.password === req.authorization.basic.password) ? true : false;
			
			if(!validated) return res.send(401);
			res.send(200, user);
		});
	});

	server.get("/users/:userid", function(req, res, next){
		var userId = req.params.userid;
		storage.read("users", {key: userId}, function(err, data){
			if(err) return res.send(500, err);
			res.send(200, data);
		});
	});

	server.get("/users", function(req, res, next){
		var keysOnly = req.params.keysOnly;
		storage.read("users", {keysOnly: keysOnly}, function(err, data){
			if(err) return res.send(500, err);
			res.send(200, data);
		});
	});

	server.post("/users/:userid", function(req, res, next){
		var userId = req.params.userid;
		var user = req.body;

		storage.read("users", {key: userId}, function(err, data){
			if(data != undefined) return res.send(406, new Error("user exists"));
			
			user.timestamp = new Date();
			user.userid = userId;
			if(!user.password) user.username = userId;
			if(!user.password) user.password = randString.generate(8);
			if(!user.groups) user.groups = ["default"];

			storage.create("users", userId, user, function(err, data){
				if(err) return res.send(500, err);
				res.send(201, { status: "created" });
			});
		});
	});

	server.put("/users/:userid", function(req, res, next){
		var userId = req.params.userid;
		var user = req.body;
		user.timestamp = new Date();
		user.userid = userId;
		storage.update("users", userId, user, function(err, data){
			if(err) return res.send(500, err);
			res.send(202, { status: "updated" });
		});
	});

	server.del("/users/:userid", function(req, res, next){
		var userId = req.params.userid;
		storage.del("users", userId, function(err, data){
			if(err) return res.send(500, err);
			res.send(202, { status: "deleted" });
		});
	});
}