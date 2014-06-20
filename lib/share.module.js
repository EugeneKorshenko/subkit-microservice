'use strict';

var fs = require('fs'),
	path = require('path'),
	_ = require('underscore');

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

	var _add = function(name){
		if(!shares[name]){
			shares[name] = {
				GET: [],
				POST: [],
				PUT: [],
				DELETE: []
			};
			_save();
		};
	};
	var _remove = function(name){
		if(shares[name]){
			delete shares[name];
			_save();
		}
	};
	var _list = function(){
		return shares;
	};
	var _listByShare = function(name, callback){
	};
	var _listByIdentity = function(identity, callback){
		return _.pairs(shares)
				.reduce(function(state,e){
					var included = _.pairs(e[1])
									.filter(function(itm){
										return itm[1].indexOf(identity) !== -1;
									})
									.map(function(itm){
										return itm[0];
									});
					state[e[0]] = included;
					return state;
				},{});
	};
	var _listByAccess = function(name, callback){
	};
	var _grantReadAccess = function(name, identity, callback){
		if(!shares[name]) callback(new Error('Share not extists.'));
		if(shares[name]['GET'].indexOf(identity) !== -1) return;
		shares[name]['GET'].push(identity);
		if(callback) callback(null, shares[name]);
		_save();
		return shares[name];
	};
	var _grantWriteAccess = function(name, identity, callback){
		if(!shares[name]) callback(new Error('Share not extists.'));
		if(shares[name]['POST'].indexOf(identity) !== -1) return;
		if(shares[name]['PUT'].indexOf(identity) !== -1) return;
		shares[name]['POST'].push(identity);
		shares[name]['PUT'].push(identity);
		if(callback) callback(null, shares[name]);
		_save();
		return shares[name];
	};
	var _grantDeleteAccess = function(name, identity, callback){
		if(!shares[name]) callback(new Error('Share not extists.'));
		if(shares[name]['DELETE'].indexOf(identity) !== -1) return;
		shares[name]['DELETE'].push(identity);
		if(callback) callback(null, shares[name]);
		_save();
		return shares[name];
	};
	var _revokeReadAccess = function(name, identity, callback){
		if(!shares[name]) callback(new Error('Share not extists.'));
		var idx = shares[name]['GET'].indexOf(identity);
		if(idx !== -1) shares[name]['GET'].splice(idx,1);
		if(callback) callback(null, shares[name]);
		_save();
		return shares[name];
	};
	var _revokeWriteAccess = function(name, identity, callback){
		if(!shares[name]) callback(new Error('Share not extists.'));
		var idx = shares[name]['POST'].indexOf(identity);
		if(idx !== -1) shares[name]['POST'].splice(idx,1);
		idx = shares[name]['PUT'].indexOf(identity);
		if(idx !== -1) shares[name]['PUT'].splice(idx,1);
		
		if(callback) callback(null, shares[name]);
		_save();
		return shares[name];
	};
	var _revokeDeleteAccess = function(name, identity, callback){
		if(!shares[name]) callback(new Error('Share not extists.'));
		var idx = shares[name]['DELETE'].indexOf(identity);
		if(idx !== -1) shares[name]['DELETE'].splice(idx,1);
		if(callback) callback(null, shares[name]);
		_save();
		return shares[name];
	};
	var _revokeAccess = function(identity, callback){
		_.pairs(shares)
		.forEach(function(itm){
			_.pairs(itm[1])
			.forEach(function(itm2){
				var idx = itm2[1].indexOf(identity);
				if(idx !== -1) itm2[1].splice(idx,1);
			})
		});
		_save();
		if(callback) callback(null, _listByIdentity(identity));
		return _listByIdentity(identity);
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
		revokeAccess: _revokeAccess
	};
};