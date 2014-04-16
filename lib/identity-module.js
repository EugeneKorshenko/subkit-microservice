var randString = require("randomstring"),
	_ = require("underscore");

module.exports.init = function(storage){
	var _group = function(name, type, filter){
		if(!name) throw new Error("Name parameter not set.")
		if(!type) throw new Error("Type parameter not set.")
		this.key = groupName;
		this.type = type;
		this.filter = filter || {};
	};
	var EMailGroup = function(groupName){
		return new _group(groupName, "EMail");
	};
	var PushNotifyGroup = function(groupName){
		return new _group(groupName, "Push");
	};
	var DeviceGroup = function(groupName){
		return new _group(groupName, "Device");
	};
	var AccountGroup = function(groupName){
		return new _group(groupName, "Account");
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
	var Device = function(){
	};
	var PushNotify = function(){
	};

	var _find = function(accountId, callback){
		storage.read("identities!accounts", {key: accountId}, callback);
	};
	var _findAll = function(jsonQuery, callback){
		storage.query("identities!accounts", {}, jsonQuery, callback);
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
		AccountGroup: AccountGroup,
		Account: Account,
		list: _list,
		find: _find,
		findAll: _findAll,
		add: _add,
		addById: _addById,
		update: _update,
		remove: _remove
	}
};