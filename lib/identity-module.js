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
	var EMail = function(address){
		return {
			address: address || "",
			timestamp: Date.now(),
			isVerified: false,
			isActive: false
		};
	};
	var Account = function(accountId, username, password){
		accountId = accountId || randString.generate(8);
		return {
			accountId: accountId,
			timestamp: Date.now(),
			validatedAt: "",
			isActive: false,
			isEnabled: false,
			username: username || accountId,
			password: password || randString.generate(8),
			location: {
				lat: 0,
				lon: 0
			},
			groups: [new Group("default")],
			email: new EMail(),
			devices: []
		};
	};

	var _find = function(accountId, callback){
		storage.read("identities!accounts", {key: accountId}, callback);
	};
	var _findAll = function(callback){
		storage.read("identities!accounts", {}, callback);
	};
	var _list = function(callback){
		storage.read("identities!accounts", {keysOnly: true}, callback);
	};
	var _add = function(callback){
		var account = new Account();
		storage.create("identities!accounts", account.accountId, account, callback);
	};
	var _addById = function(accountId, callback){
		storage.read("identities!accounts", {key: accountId}, function(err, data){
			if(data != undefined){
				if(callback) callback(new Error("account exists"));
				return;
			}
			var account = new Account(accountId);
			storage.create("identities!accounts", accountId, account, callback);
		});
	};
	var _update = function(accountId, account, callback){
		account.timestamp = Date.now();
		account.accountId = accountId;
		storage.update("identities!accounts", accountId, account, callback);
	};
	var _remove = function(accountId, callback){
		storage.del("identities!accounts", accountId, callback);
	};

	return {
		Group: Group,
		Account: Account,
		list: _list,
		find: _find,
		findAll: _findAll,
		add: _add,
		addById: _addById,
		update: _update,
		remove: _remove
	}
}