'use strict';

var randString = require('randomstring'),
	utils = require('./utils.module.js').init();    


var Identity = function(type, storage){
	var self = this;
	var _type = type;

	self.findAll = function(options, jsonQuery, callback){
		storage.query('identities', options, jsonQuery, callback);
	};
	self.listAll = function(callback){
		storage.query('identities', {keysOnly: true}, {}, callback);
	};
	self.list = function(callback){
		storage.query('identities!'+_type, {keysOnly: true}, {}, callback);
	};
	self.find = function(options, jsonQuery, callback){
		storage.query('identities!'+_type, options, jsonQuery, callback);
	};
	self.get = function(id, callback){
		storage.query('identities!'+_type, {key: id}, {}, callback);
	};
	self.add = function(id, identity, callback){
		if(!id) return callback(new Error('No "id" property set.'));
		if(!identity) return callback(new Error('No identity set.'));

		identity.$timestamp = new Date().toISOString();
		identity.id = id || randString.generate(7);

		storage.query('identities!'+_type, {key: id}, {}, function(err, data){
			if(data){
				if(callback) callback(new Error('Identity already exists. (duplicate id)'));
				return;
			}
			storage.update('identities!'+_type, id, identity, callback);
		});
	};
	self.update = function(id, identity, callback){
		if(!id) return callback(new Error('No "id" property set.'));
		if(!identity) return callback(new Error('No identity set.'));
		
		identity.$timestamp = new Date().toISOString();
		identity.$id = id;
		storage.update('identities!'+_type, id, identity, callback);
	};
	self.remove = function(id, callback){
		if(!id) return callback(new Error('No "id" property found.'));
		storage.del('identities!'+_type, id, callback);
	};
	self.validate = function(key, token, callback){
		if(!key) return callback(new Error('Parameter "key" not set.'));
		self.findAll({}, { $or: [ {'apiKey': key}, { 'id': key } ] }, function(error, data){
			if(error) return callback(error);
			//user not found
			if(data.results.length === 0) return callback(null, null);
			//key found, don't validate token token
			if(data.results.length === 1 && key && !token) return callback(null, data.results[0].$payload);
			//key and token found, validate password
			if(!utils.validate(data.results[0].$payload.password, token)) return callback(new Error('Password not valid.'));
			
			callback(null, data.results[0].$payload);
		});
	};
};

module.exports.init = function(type, storage){
	return new Identity(type, storage);
};