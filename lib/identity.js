var randString = require("randomstring"),
	_ = require("underscore");

module.exports.init = function(server, storage, identity, helper){
	var Group = function(groupName){
		return {
			key: groupName,
			isEmail: false,
			isPushNotify: false
		};
	};

	server.get("/identities/settings", helper.apiAuth, function(req, res, next){
		res.send(200, {});
	});

	//identity ops
	server.get("/identities/login/:identityId", helper.apiAuth, function(req, res, next){
		var identityId = req.params.identityId;
		
		storage.read("identities", {key: identityId}, function(err, user){
			if(err) return res.send(500, err);
			user = JSON.parse(user);

			var validated = false;
			validated = (user.username && req.username && user.username === req.username) ? true : false;
			validated = (user.password && req.authorization && req.authorization.basic && req.authorization.basic.password && user.password === req.authorization.basic.password) ? true : false;
			if(!validated) return res.send(401);
			user.validatedAt = Date.now();
			storage.update("identities", identityId, user, function(err, data){
				if(err) return res.send(500, err);
				res.send(200, user);
			});
		});
	});

	//groups
	server.get("/identities/groups", helper.apiAuth, function(req, res, next){
		storage.read("identities", {}, function(err, data){
			if(err) return res.send(500, err);
			var groups = data.reduce(function(state, event){
				var userGroups = event.value.groups || [];
				userGroups.forEach(function(group){
					state[group.key] = [];
				});
				return state;
			}, {});
			var result = [];
			for(var group in groups){
				result.push(new Group(group));
			}
			res.send(200, result);
		});		
	});
	server.get("/identities/groups/users", helper.apiAuth, function(req, res, next){
		storage.read("identities", {}, function(err, data){
			if(err) return res.send(500, err);
			var groups = data.reduce(function(state, event){
				var userGroups = event.value.groups || [];
				userGroups.forEach(function(group){
					if(!state[group.key]) state[group.key] = [];
					state[group.key].push(event);
				});
				return state;
			}, {});
			res.send(200, groups);
		});		
	});
	server.get("/identities/groups/:groupId", helper.apiAuth, function(req, res, next){
		var groupId = req.params.groupId;

		storage.read("identities", {}, function(err, data){
			if(err) return res.send(500, err);
			var groups = data.reduce(function(state, event){
				var userGroups = event.value.groups || [];
				userGroups.filter(function(itm){
					return itm.key === groupId;
				}).forEach(function(group){
					if(!state[group.key]) state[group.key] = [];
					state[group.key].push(event);
				});
				return state;
			}, {});
			res.send(200, groups[groupId] || []);
		});		
	});

	//identity group
	server.get("/identities/:identityId/groups", helper.apiAuth, function(req, res, next){
		var identityId = req.params.identityId;
		storage.read("identities", {key: identityId}, function(err, data){
			if(err) return res.send(500, err);
			var result = data.groups.map(function(itm){
				itm.identityId = identityId;
				return itm;
			})
			res.send(200, result);
		});
	});
	server.put("/identities/:identityId/groups/:groupid", helper.apiAuth, function(req, res, next){
		var identityId = req.params.identityId;
		var groupid = req.params.groupid;
		var metadata = req.body;

		storage.read("identities", {key: identityId}, function(err, user){
			if(err) return res.send(500, err);

			var groupLookup = _.findWhere(user.groups, {key: groupid});			
			if(!groupLookup) user.groups.push(new Group(groupid));

			storage.update("identities", identityId, user, function(err, data){
				if(err) return res.send(500, err);
				res.send(202, { status: "changed" });
			});
		});
	});
	server.del("/identities/:identityId/groups/:groupid", helper.apiAuth, function(req, res, next){
		var identityId = req.params.identityId;
		var groupid = req.params.groupid;
		var metadata = req.body;

		storage.read("identities", {key: identityId}, function(err, user){
			if(err) return res.send(500, err);

			user.groups = _.without(user.groups, _.findWhere(user.groups, {key: groupid}));

			storage.update("identities", identityId, user, function(err, data){
				if(err) return res.send(500, err);
				res.send(202, { status: "removed" });
			});
		});
	});

	//identity
	server.get("/identities/:identityId", helper.apiAuth, function(req, res, next){
		var identityId = req.params.identityId;
		identity.loadById(identityId, function(err, data){
			if(err) return res.send(500, err);
			res.send(200, data);
		});
	});
	server.get("/identities", helper.apiAuth, function(req, res, next){
		var keysOnly = req.params.keysOnly;

		var response = function(err, data){
			if(err) return res.send(500, err);
			res.send(200, data);
		};
		if(keysOnly) identity.list(response);
		else identity.load(response);
	});
	server.post("/identities", helper.apiAuth, function(req, res, next){
		identity.create(function(err, data){
			if(err) return res.send(500, err);
			res.send(201, { status: "created" });
		});
	});
	server.post("/identities/:identityId", helper.apiAuth, function(req, res, next){
		var identityId = req.params.identityId;

		identity.createById(identityId, function(err, data){
			if(err) return res.send(406, err);
			res.send(201, { status: "created" });
		});
	});
	server.put("/identities/:identityId", helper.apiAuth, function(req, res, next){
		var identityId = req.params.identityId;
		var newIdentity = req.body;

		identity.changeById(identityId, newIdentity, function(err, data){
			if(err) return res.send(500, err);
			res.send(202, { status: "updated" });
		});
	});
	server.del("/identities/:identityId", helper.apiAuth, function(req, res, next){
		var identityId = req.params.identityId;
		identity.removeById(identityId, function(err, data){
			if(err) return res.send(500, err);
			res.send(202, { status: "deleted" });
		});
	});

	//devices
	server.get("/identities/:identityId/devices", helper.apiAuth, function(req, res, next){
		var identityId = req.params.identityId;
		storage.read("identities", {key: identityId}, function(err, data){
			if(err) return res.send(500, err);
			var result = data.devices.map(function(itm){
				itm.identityId = identityId;
				return itm;
			})
			res.send(200, result);
		});
	});
	server.put("/identities/:identityId/devices/:deviceid", helper.apiAuth, function(req, res, next){
		var identityId = req.params.identityId;
		var deviceid = req.params.deviceid;
		var metadata = req.body;

		var device = {
			deviceid: deviceid,
			timestamp: Date.now(),
			metadata: metadata
		};

		storage.read("identities", {key: identityId}, function(err, identity){
			if(err) return res.send(500, err);

			var deviceLookup = _.findWhere(identity.devices, {deviceid: deviceid});

			if(!deviceLookup) identity.devices.push(device);
			else deviceLookup.timestamp = Date.now();

			storage.update("identities", identityId, identity, function(err, data){
				if(err) return res.send(500, err);
				res.send(202, { status: "changed" });
			});
		});
	});
	server.del("/identities/:identityId/devices/:deviceid", helper.apiAuth, function(req, res, next){
		var identityId = req.params.identityId;
		var deviceid = req.params.deviceid;

		storage.read("identities", {key: identityId}, function(err, user){
			if(err) return res.send(500, err);
			
			user.devices = _.without(user.devices, _.findWhere(user.devices, {deviceid: deviceid}));

			storage.update("identities", identityId, user, function(err, data){
				if(err) return res.send(500, err);
				res.send(202, { status: "removed" });
			});
		});
	});
}