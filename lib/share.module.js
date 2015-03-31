'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var utils = require('./utils.module.js').init();

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
module.exports = function (config) {
	module.exports.init(config);
};
module.exports.init = function(conf){
	if(!conf) throw new Error('No configuration found.');
	
	var shares = {};
	var sharePath = './files/shares/';
	var sharesFilePath = path.join(sharePath, 'shares.json');

	//watch share file changes
	fs.watchFile(sharesFilePath, function () {
		utils.log('share',{
			type: 'share',
			status: 'success',
			message: 'Shares changed'
		});
		_loadShares();
	});

	//set default permissions
	if(!fs.existsSync(sharesFilePath)){
		utils.mkdirRecursive(sharePath);
	}

	_loadShares();
	return {
		add: add,
		remove: remove,
		list: list,
		listByShare:listByShare,
		listByIdentity:listByIdentity,
		listByAccess:listByAccess,
		listIdentities:listIdentities,
		grantReadAccess: grantReadAccess,
		grantInsertAccess: grantInsertAccess,
		grantUpdateAccess: grantUpdateAccess,
		grantDeleteAccess: grantDeleteAccess,
		revokeReadAccess: revokeReadAccess,
		revokeInsertAccess: revokeInsertAccess,
		revokeUpdateAccess: revokeUpdateAccess,
		revokeDeleteAccess: revokeDeleteAccess,
		revokeAccess: revokeAccess
	};

	function add(name, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		if(!shares[name]){
			shares[name] = {
				GET: [],
				POST: [],
				PUT: [],
				DELETE: []
			};
			_saveShares();
		}
		callback(null, shares[name]);
	}
	function remove(name, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		if(shares[name]){
			delete shares[name];
			_saveShares();
			callback(null, shares[name]);
		}
	}
	function list(callback){
		if(!callback) callback = function(){};
		callback(null, shares);
		return shares;
	}
	function listByShare(name, callback){
		//TODO
		if(callback) callback(null, name);
	}
	function listByIdentity(identity, callback){
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
	}
	function listByAccess(name, callback){
		//TODO
		if(callback) callback(null, name);		
	}
	function listIdentities(callback){
		if(!callback) callback = function(){};
		var result = _.pairs(shares)
					.reduce(function(state,e){
						_.pairs(e[1])
							.map(function(itm){
								itm[1].map(function(identity){
									state.push(identity);
								});
							});
						return state;
					},[]);
		result = _.uniq(result);
		callback(null, result);
		return result;
	}
	function grantReadAccess(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;

		if(!shares[name]) add(name);
		
		if(shares[name].GET.indexOf(identity) !== -1) return callback(null, shares[name]);
		shares[name].GET.push(identity);

		_saveShares();
		callback(null, shares[name]);
		return shares[name];
	}
	function grantInsertAccess(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		
		if(!shares[name]) add(name);

		if(shares[name].POST.indexOf(identity) !== -1) return callback(null, shares[name]);
		shares[name].POST.push(identity);

		_saveShares();
		callback(null, shares[name]);
		return shares[name];
	}
	function grantUpdateAccess(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		
		if(!shares[name]) add(name);

		if(shares[name].PUT.indexOf(identity) !== -1) return callback(null, shares[name]);
		shares[name].PUT.push(identity);

		_saveShares();
		callback(null, shares[name]);
		return shares[name];
	}	
	function grantDeleteAccess(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		
		if(!shares[name]) add(name);

		if(shares[name].DELETE.indexOf(identity) !== -1) return callback(null, shares[name]);
		shares[name].DELETE.push(identity);

		_saveShares();
		callback(null, shares[name]);
		return shares[name];
	}
	function revokeReadAccess(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;

		if(!shares[name]) add(name);

		var idx = shares[name].GET.indexOf(identity);
		if(idx !== -1) shares[name].GET.splice(idx,1);

		_saveShares();
		callback(null, shares[name]);
		return shares[name];
	}
	function revokeInsertAccess(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		
		if(!shares[name]) add(name);

		var idx = shares[name].POST.indexOf(identity);
		if(idx !== -1) shares[name].POST.splice(idx,1);
		
		_saveShares();
		callback(null, shares[name]);
		return shares[name];
	}
	function revokeUpdateAccess(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		
		if(!shares[name]) add(name);

		var idx = shares[name].PUT.indexOf(identity);
		if(idx !== -1) shares[name].PUT.splice(idx,1);
		
		_saveShares();
		callback(null, shares[name]);
		return shares[name];
	}
	function revokeDeleteAccess(name, identity, callback){
		if(!callback) callback = function(){};
		if(name.indexOf('/') !== 0) name = '/'+name;
		
		if(!shares[name]) add(name);
		
		var idx = shares[name].DELETE.indexOf(identity);
		if(idx !== -1) shares[name].DELETE.splice(idx,1);
		_saveShares();
		callback(null, shares[name]);
		return shares[name];
	}
	function revokeAccess(identity, callback){
		if(!callback) callback = function(){};
		_.pairs(shares)
		.forEach(function(itm){
			_.pairs(itm[1])
			.forEach(function(itm2){
				var idx = itm2[1].indexOf(identity);
				if(idx !== -1) itm2[1].splice(idx,1);
			});
		});

		_saveShares();
		callback(null, listByIdentity(identity));
		return listByIdentity(identity);
	}
	
	function _saveShares(){
		try{
			fs.writeFileSync(sharesFilePath, JSON.stringify(shares, null, 4));	
		}catch(e){
			utils.log('share',{
				type: 'share',
				status: 'error',
				error: e,
				message: 'Shares can not be written'
			});
		}
	}
	function _loadShares(){
		try{
			shares = JSON.parse(fs.readFileSync(sharesFilePath,'utf8'));
		}catch(e){
			shares = {};
			utils.log('share',{
				type: 'share',
				status: 'error',
				error: e,
				message: 'Shares can not be loaded'
			});			
		}
	}

};
