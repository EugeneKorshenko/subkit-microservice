'use strict';

var randString = require("randomstring"),
	_ = require("underscore");


var Identity = function(type, storage){
	var self = this;
	var _type = type;

	self.findAll = function(options, jsonQuery, callback){
		storage.query("identities", options, jsonQuery, callback);
	};
	self.listAll = function(callback){
		storage.read("identities", {keysOnly: true}, callback);
	};
	
	self.list = function(callback){
		storage.read("identities!"+_type, {keysOnly: true}, callback);
	};
	self.find = function(options, jsonQuery, callback){
		storage.query("identities!"+_type, options, jsonQuery, callback);
	};
	self.get = function(id, callback){
		storage.read("identities!"+_type, {key: id}, callback);
	};
	self.add = function(identity, callback){
		if(!identity) throw new Error("No identity parameter set.")
		if(!identity.id) throw new Error("No identity 'id' property found.")
		identity.timestamp = Date.now();
		storage.create("identities!"+_type, identity.id, identity, callback);
	};
	self.addById = function(id, identity, callback){
		if(!id) throw new Error("No 'id' property set.")
		if(!identity) throw new Error("No identity set.")
		if(!identity.id) throw new Error("No identity 'id' property found.")

		identity.timestamp = Date.now();
		identity.id = id;

		storage.read("identities!"+_type, {key: id}, function(err, data){
			if(data != undefined){
				if(callback) callback(new Error("Identity already exists. (duplicate id)"));
				return;
			}
			storage.create("identities!"+_type, id, identity, callback);
		});
	};
	self.update = function(id, identity, callback){
		if(!id) throw new Error("No 'id' property set.")
		if(!identity) throw new Error("No identity set.")
		if(!identity.id) throw new Error("No identity 'id' property found.")
		identity.timestamp = Date.now();
		identity.id = id;
		storage.update("identities!"+_type, id, identity, callback);
	};
	self.remove = function(id, callback){
		if(!id) throw new Error("No 'id' property found.")
		storage.del("identities!"+_type, id, callback);
	};
};


module.exports.init = function(type, storage){
	var identity = new Identity(type, storage);

	var _group = function(name, type, filter){
		if(!name) throw new Error("Name parameter not set.")
		if(!type) throw new Error("Type parameter not set.")
		this.key = groupName;
		this.type = type;
		this.filter = filter || {};
	};

	var _identity = function(id){

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

	var EMail = function(address){
		return {
			address: address || "",
			timestamp: Date.now(),
			isVerified: false,
			isActive: false
		};
	};
	var Device = function(){
	};
	var PushNotify = function(){
	};
	return identity;
	// return {
	// 	AccountGroup: AccountGroup,
	// 	Account: Account,
	// 	list: _list,
	// 	find: _find,
	// 	findAll: _findAll,
	// 	add: _add,
	// 	addById: _addById,
	// 	update: _update,
	// 	remove: _remove
	// }
};