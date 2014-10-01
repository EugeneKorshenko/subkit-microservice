'use strict';

var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	utils = require('./helper.js').init();

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
	var sharePath = './files/shares/';
	var sharesFilePath = path.join(sharePath, 'shares.json');

	fs.watchFile(sharesFilePath, function (curr, prev) {
		console.log("shares changed!");
		_load();
	});

	var _save = function(){
		try{
			fs.writeFileSync(sharesFilePath, JSON.stringify(shares, null, 4));	
		}catch(e){}
	};
	var _load = function(){
		try{
			shares = JSON.parse(fs.readFileSync(sharesFilePath,'utf8'));
		}catch(e){
			shares = {};
		}
	};

	var _add = function(name, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		if(!shares[name]){
			shares[name] = {
				GET: [],
				POST: [],
				PUT: [],
				DELETE: []
			};
			_save();
		};
		callback(null, shares[name]);
	};
	var _remove = function(name, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		if(shares[name]){
			delete shares[name];
			_save();
			callback(null, shares[name]);
		}
	};
	var _list = function(callback){
		if(!callback) callback = function(){};
		callback(null, shares);
		return shares;
	};
	var _listByShare = function(name, callback){
	};
	var _listByIdentity = function(identity, callback){
		if(!callback) callback = function(){};
		var result = _.pairs(shares)
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

		callback(null, result);
		return result;
	};
	var _listByAccess = function(name, callback){
	};
	var _listIdentities = function(callback){
		if(!callback) callback = function(){};
		var result = _.pairs(shares)
					.reduce(function(state,e){
						_.pairs(e[1])
							.map(function(itm){
								itm[1].map(function(identity){
									state.push(identity);
								})
							});
						return state;
					},[]);
		result = _.uniq(result);
		callback(null, result);
		return result;
	};
	var _grantReadAccess = function(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;

		if(!shares[name]) _add(name);
		
		if(shares[name]['GET'].indexOf(identity) !== -1) return callback(null, shares[name]);
		shares[name]['GET'].push(identity);

		_save();
		callback(null, shares[name]);
		return shares[name];
	};
	var _grantWriteAccess = function(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		
		if(!shares[name]) _add(name);

		if(shares[name]['POST'].indexOf(identity) !== -1) return callback(null, shares[name]);
		if(shares[name]['PUT'].indexOf(identity) !== -1) return callback(null, shares[name]);
		shares[name]['POST'].push(identity);
		shares[name]['PUT'].push(identity);

		_save();
		callback(null, shares[name]);
		return shares[name];
	};
	var _grantDeleteAccess = function(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		
		if(!shares[name]) _add(name);

		if(shares[name]['DELETE'].indexOf(identity) !== -1) return callback(null, shares[name]);
		shares[name]['DELETE'].push(identity);

		_save();
		callback(null, shares[name]);
		return shares[name];
	};
	var _revokeReadAccess = function(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;

		if(!shares[name]) _add(name);

		var idx = shares[name]['GET'].indexOf(identity);
		if(idx !== -1) shares[name]['GET'].splice(idx,1);

		_save();
		callback(null, shares[name]);
		return shares[name];
	};
	var _revokeWriteAccess = function(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		
		if(!shares[name]) _add(name);

		var idx = shares[name]['POST'].indexOf(identity);
		if(idx !== -1) shares[name]['POST'].splice(idx,1);
		idx = shares[name]['PUT'].indexOf(identity);
		if(idx !== -1) shares[name]['PUT'].splice(idx,1);
		
		_save();
		callback(null, shares[name]);
		return shares[name];
	};
	var _revokeDeleteAccess = function(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		
		if(!shares[name]) _add(name);
		
		var idx = shares[name]['DELETE'].indexOf(identity);
		if(idx !== -1) shares[name]['DELETE'].splice(idx,1);
		_save();
		callback(null, shares[name]);
		return shares[name];
	};
	var _revokeAccess = function(identity, callback){
		if(!callback) callback = function(){};
		_.pairs(shares)
		.forEach(function(itm){
			_.pairs(itm[1])
			.forEach(function(itm2){
				var idx = itm2[1].indexOf(identity);
				if(idx !== -1) itm2[1].splice(idx,1);
			})
		});

		_save();
		callback(null, _listByIdentity(identity));
		return _listByIdentity(identity);
	};
	
	if(!fs.existsSync(sharesFilePath)){
		utils.mkdirRecursive(sharePath);
		_add('/');
		_grantReadAccess('/', 'anonymous');
		_add('/libs');
		_grantReadAccess('/libs', 'anonymous');
		_add('/css');
		_grantReadAccess('/css', 'anonymous');
		_add('/sdk');
		_grantReadAccess('/sdk', 'anonymous');
		_add('/js');
		_grantReadAccess('/js', 'anonymous');
		_add('/img');
		_grantReadAccess('/img', 'anonymous');
		_add('/doc');
		_grantReadAccess('/doc', 'anonymous');
	};
	_load();
	return {
		add: _add,
		remove: _remove,
		list:_list,
		listByShare:_listByShare,
		listByIdentity:_listByIdentity,
		listByAccess:_listByAccess,
		listIdentities:_listIdentities,
		grantReadAccess: _grantReadAccess,
		grantWriteAccess: _grantWriteAccess,
		grantDeleteAccess: _grantDeleteAccess,
		revokeReadAccess: _revokeReadAccess,
		revokeWriteAccess: _revokeWriteAccess,
		revokeDeleteAccess: _revokeDeleteAccess,
		revokeAccess: _revokeAccess
	};
};