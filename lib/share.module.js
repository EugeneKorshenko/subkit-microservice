'use strict';

var fs = require('fs'),
	path = require('path');

/**
* @module share
*/
/**
 * Async result callback.
 * @callback callback
 * @param {Object} error
 * @param {Object} data
 */
/**
* share module.
* @param {Object} config - Configuration.
* @param {Object} pubsub - PubSub module dependency.
*/
module.exports = function (config, pubsub) {
	module.exports.init(config, pubsub);
};
module.exports.init = function(conf, pubsub){
	if(!conf) throw new Error('No configuration found.');
	
	var shares = {};
	var filePath = './files/shares/shares.json';
	
	fs.watchFile(filePath, function (curr, prev) {
		console.log("shares changed!");
		_load();
	});

	var _save = function(){
		try{
			fs.writeFileSync(filePath, JSON.stringify(shares, null, 4));	
		}catch(e){}
	};
	var _load = function(){
		try{
			shares = JSON.parse(fs.readFileSync(filePath,'utf8'));
		}catch(e){
			shares = {};
		}
	};

	var _add = function(name, callback){

	};
	var _remove = function(name, callback){

	};
	var _list = function(){
		return shares;
	};
	var _listByShare = function(name, callback){

	};
	var _listByIdentity = function(name, callback){

	};
	var _listByAccess = function(name, callback){

	};
	var _grantReadAccess = function(name, identity, callback){

	};
	var _grantWriteAccess = function(name, identity, callback){

	};
	var _grantDeleteAccess = function(name, identity, callback){

	};
	var _revokeReadAccess = function(name, identity, callback){

	};
	var _revokeWriteAccess = function(name, identity, callback){

	};
	var _revokeDeleteAccess = function(name, identity, callback){

	};

	_load();
	return {
		add: _add,
		remove: _remove,
		list:_list,
		listByShare:_listByShare,
		listByIdentity:_listByIdentity,
		listByAccess:_listByAccess,
		grantReadAccess: _grantReadAccess,
		grantWriteAccess: _grantWriteAccess,
		grantDeleteAccess: _grantDeleteAccess,
		revokeReadAccess: _revokeReadAccess,
		revokeWriteAccess: _revokeWriteAccess,
		revokeDeleteAccess: _revokeDeleteAccess,
	};
};