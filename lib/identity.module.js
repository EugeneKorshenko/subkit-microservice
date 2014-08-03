'use strict';

var randString = require('randomstring'),
	utils = require('./helper.js').init();    


var Identity = function(type, storage){
	var self = this;
	var _type = type;

	self.findAll = function(options, jsonQuery, callback){
		storage.query('identities', options, jsonQuery, callback);
	};
	self.listAll = function(callback){
		storage.read('identities', {keysOnly: true}, callback);
	};
	self.list = function(callback){
		storage.read('identities!'+_type, {keysOnly: true}, callback);
	};
	self.find = function(options, jsonQuery, callback){
		storage.query('identities!'+_type, options, jsonQuery, callback);
	};
	self.get = function(id, callback){
		storage.read('identities!'+_type, {key: id}, callback);
	};
	self.add = function(id, identity, callback){
		if(!id) return callback(new Error('No "id" property set.'));
		if(!identity) return callback(new Error('No identity set.'));

		identity.timestamp = Date.now();
		identity.id = id || randString.generate(7);

		storage.read('identities!'+_type, {key: id}, function(err, data){
			if(data){
				if(callback) callback(new Error('Identity already exists. (duplicate id)'));
				return;
			}
			storage.upsert('identities!'+_type, id, identity, callback);
		});
	};
	self.update = function(id, identity, callback){
		if(!id) return callback(new Error('No "id" property set.'));
		if(!identity) return callback(new Error('No identity set.'));
		
		identity.timestamp = Date.now();
		identity.id = id;
		storage.upsert('identities!'+_type, id, identity, callback);
	};
	self.remove = function(id, callback){
		if(!id) return callback(new Error('No "id" property found.'));
		storage.del('identities!'+_type, id, callback);
	};
	self.validate = function(key, token, callback){
		if(!key) return callback(new Error('Parameter "key" not set.'));
		self.findAll({}, { $or: [ {'value.apiKey': key}, { 'value.id': key } ] }, function(error, data){
			if(error) return callback(error);
			if(data.length === 0) return callback(null, null);
			if(!utils.validate(data[0].value.password, token)) return callback(new Error('Password not valid.'));
			callback(null, data[0].value);
		});
	};
};

module.exports.init = function(type, storage){
	return new Identity(type, storage);
};