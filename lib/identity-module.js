var randString = require("randomstring"),
	_ = require("underscore");
	
module.exports.init = function(storage){
	var Group = function(groupName){
		return {
			key: groupName,
			isEmail: false,
			isPushNotify: false
		};
	};
	var EMailGroup = function(groupName){
		return {
			key: groupName,
			isEmail: true,
			isPushNotify: false
		};
	};
	var NotifyGroup = function(groupName){
		return {
			key: groupName,
			isEmail: false,
			isPushNotify: true
		};
	};
	var Identity = function(identityId, username, password){
		identityId = identityId || randString.generate(8);
		return {
			identityId: identityId,
			timestamp: Date.now(),
			validatedAt: "",
			username: username || identityId,
			password: password || randString.generate(8),
			groups: [{
				key: "default",
				isEmail: false,
				isPushNotify: false
			}],
			email: {
				address: "",
				verified: false
			},
			devices: []
		};
	};

	var _create = function(callback){
		var identity = new Identity();
		storage.create("identities", identity.identityId, identity, callback);
	};

	var _createById = function(identityId, callback){
		storage.read("identities", {key: identityId}, function(err, data){
			if(data != undefined){
				if(callback) callback(new Error("identity exists"));
				return;
			}
			var identity = new Identity(identityId);
			storage.create("identities", identityId, identity, callback);
		});
	};

	return {
		Group: Group,
		Identity: Identity,
		create: _create,
		createById: _createById
	}
}