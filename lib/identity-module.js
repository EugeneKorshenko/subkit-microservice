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
	var Device = function(deviceId){
		return {
			deviceid: deviceid || "",
			timestamp: Date.now(),
			metadata: metadata,
			isActive: false
		};
	};
	var EMail = function(address){
		return {
			address: address || "",
			timestamp: Date.now(),
			isVerified: false,
			isActive: false
		};
	};
	var Identity = function(identityId, username, password){
		identityId = identityId || randString.generate(8);
		return {
			identityId: identityId,
			timestamp: Date.now(),
			validatedAt: "",
			isActive: false,
			isEnabled: false,
			username: username || identityId,
			password: password || randString.generate(8),
			location: {
				lat: 0,
				lon: 0
			},
			groups: [new Group("default")],
			email: new Email(),
			devices: []
		};
	};

	var _loadById = function(identityId, callback){
		storage.read("identities", {key: identityId}, callback);
	};
	var _load = function(callback){
		storage.read("identities", {}, callback);
	};
	var _list = function(callback){
		storage.read("identities", {keysOnly: true}, callback);
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
	var _changeById = function(identityId, identity, callback){
		identity.timestamp = Date.now();
		identity.identityId = identityId;
		storage.update("identities", identityId, identity, callback);
	};
	var _removeById = function(identityId, callback){
		storage.del("identities", identityId, callback);
	};


	return {
		Group: Group,
		Identity: Identity,
		list: _list,
		loadById: _loadById,
		load: _load,
		create: _create,
		createById: _createById,
		changeById: _changeById,
		removeById: _removeById
	}
}