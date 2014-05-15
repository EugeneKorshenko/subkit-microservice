'use strict';

var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	jsonquery = require('jsonquery'),
	microtime = require('microtime'),
	levelup = require('level');

require("underscore-keypath");

/**
* @module store
*/
/**
 * Async result callback.
 * @callback callback
 * @param {Object} error
 * @param {Object} data
 */
/**
* JSON key/value storage module.
* @param {Object} config
*/
module.exports = function (config) {
	module.exports.init(config);
};

module.exports.init = function(conf){
	if(!conf) throw new Error('No config found.');
	
	var config = conf;
	var db = levelup(config.dbPath, {keyEncoding:'utf8', valueEncoding:'json'});
	var rights;
	var versions = [];

	var _toBackupFormat = function(date) {
	    var pad_two = function(n) {
	        return (n < 10 ? '0' : '') + n;
	    };
	    var pad_three = function(n) {
	        return (n < 100 ? '0' : '') + (n < 10 ? '0' : '') + n;
	    };
	    return [
	        date.getUTCFullYear(),
	        '-',
	        pad_two(date.getUTCMonth() + 1),
	        '-',
	        pad_two(date.getUTCDate()),
	        'T',
	        pad_two(date.getUTCHours()),
	        '-',
	        pad_two(date.getUTCMinutes()),
	        '-',
	        pad_two(date.getUTCSeconds()),
	        '-',
	        pad_three(date.getUTCMilliseconds()),
	        'Z',
	    ].join('');
	};

	var writeRights = function(){
		fs.writeFileSync(config.rightsPath, JSON.stringify(rights));
	};
	var readRights = function(){
		var data = fs.readFileSync(config.rightsPath);
		rights = JSON.parse(data);
	};
	var setPublic = function(storeName, callback){
		var match = rights.public.indexOf(storeName);

		if(match === -1){
			rights.public.push(storeName);
			writeRights();
			callback(null, {
				grant: true,
				name: storeName
			});
		}else{
			callback(new Error('store not found'));
		}
	};
	var setPrivate = function(storeName, callback){
		var match = rights.public.indexOf(storeName);

		if(match !== -1){
			rights.public.splice(match, 1);
			writeRights();
			callback(null, {
				grant: false,
				name: storeName
			});
		}else{
			callback(new Error('store not found'));
		}
	};

	var stores = function(callback){
		var resourceKeys = [];
		db.keyStream()
			.on('data', function (data) {
				var resouceKey = data.substr(0,data.indexOf('!'));
				if(!resouceKey) resouceKey = data;
				var isNotIncluded = _.filter(resourceKeys, function(item){ return item.name  === resouceKey; }).length === 0;
				var isGrant = _.contains(rights.public, resouceKey);
				if(isNotIncluded) resourceKeys.push({
					grant: isGrant,
					name: resouceKey
				});
			})
			.on('error', function (error) {
				return callback(error);
			})
			.on('close', function () {
			})
			.on('end', function () {
				callback(null, resourceKeys);
			});
	};
	var read = function(resource, options, callback){
		if(!options) return callback(new Error('options parameter not defined.'));

		if(!options.key) {
			var elements = [];
			options.limit = options.limit || -1;
			options.fillCache = options.cache || false;
			options.keys = options.keys || true;
			options.values = !options.keysOnly || true;
			options.valueEncoding = 'json';

			if(options.from){
				options.start = resource + '!' + options.from;
				options.end = options.from.indexOf('!') === -1 ? resource + '~' : resource  + '!' + options.from + '~';
			} else {
				options.start = resource + '!';
				options.end = resource + '~';
			}
			db.readStream(options)
			  .on('data', function (data) {
			  		var items = data.key.split('!');
			  		var desciptor = items.shift();
			  		var element = {
				    	store: desciptor,
				    	// name: desciptor,
				    	key: items.join('!')
				    };
				    if(!options.keysOnly) element.value = data.value;
				    elements.push(element);
			  })
			  .on('error', function (err) {
			  		callback(err, undefined);
			  })
			  .on('close', function () {
			  })
			  .on('end', function () {
					callback(undefined, elements);
			  });
		}else{
			var resourceKey = resource + '!' + options.key;
			db.get(resourceKey, function (err, value) {
			  if (err) return callback(err, undefined);
			  callback(undefined, value);
			});
		}
	};
	var query = function(resource, options, queryString, callback){
		if(!options) return callback(new Error('options parameter not defined.'));

		if(!options.key) {
			var elements = [];
			var error = null;
			options.limit = options.limit || -1;
			options.fillCache = options.cache || false;
			options.keys = options.keys || true;
			options.values = !options.keysOnly || true;
			options.valueEncoding = 'json';

			if(options.from){
				options.start = resource + '!' + options.from;
				options.end = options.from.indexOf('!') === -1 ? resource + '~' : resource  + '!' + options.from + '~';
			} else {
				options.start = resource + '!';
				options.end = resource + '~';
			}
			db.readStream(options)
			  .on('data', function (data) {
			  		var items = data.key.split('!');
			  		var desciptor = items.shift();
			  		var element = {
				    	store:  desciptor,
				    	// name: desciptor,
				    	key: items.join('!')
				    };
				    if(!options.keysOnly) element.value = data.value;
				    try {
						if(jsonquery.match(element, queryString)) elements.push(element);
					}catch(e){}
			  })
			  .on('error', function (err) {
			  		error = err;
			  		callback(err);
			  })
			  .on('close', function () {
			  })
			  .on('end', function () {
			  		if(options.groupingKey){
			  			var grouped = elements.reduce(function(previousValue, currentValue, index, array){
			  				var groupKey = _(currentValue).valueForKeyPath(options.groupingKey);
				  			
				  			if(!_.isArray(groupKey)){
				  				if(!previousValue[groupKey]) previousValue[groupKey] = [];
				  				previousValue[groupKey].push(currentValue);
			  				} else {
			  					groupKey.forEach(function(subitm){
			  						if(!previousValue[subitm]) previousValue[subitm] = [];
									previousValue[subitm].push(currentValue);
			  					});
			  				}
			  				return previousValue;
			  			}, {});

			  			if(!error) callback(null, grouped);
			  		}else{
			  			if(!error) callback(null, elements);
			  		}
					
			  });
		}else{
			var resourceKey = resource + '!' + options.key;
			db.get(resourceKey, function (err, value) {
			  if (err) return callback(err, undefined);
			  callback(undefined, value);
			});
		}
	};
	var upsert = function(resource, key, payload, callback){
		// payload.version = microtime.now();
		// payload.timestamp = Date.now();
		db.put(resource + '!' + key, payload, {sync : false}, callback);
	};
	var tryUpsert = function(resource, key, payload, callback){
		// payload.version = microtime.now();
		// payload.timestamp = Date.now();
		db.put(resource + '!' + key, payload, {sync : true}, callback);
	};
	var del = function(resource, key, callback){
		if(key) return db.del(resource + '!' + key, {sync : false}, callback);

		read(resource, {}, function(err, data){
			if(err) return callback(err);
			data.forEach(function(item){
				db.del(resource + '!' + item.key, {sync : false});
			});
			callback();
		});
	};
	var tryDel = function(resource, key, callback){
		if(key) return db.del(resource + '!' + key, {sync : true}, callback);

		read(resource, {}, function(err, data){
			if(err) return callback(err);
			data.forEach(function(item){
				db.del(resource + '!' + item.key, {sync : true});
			});
			callback();
		});
	};	
	var batch = function(data, callback){
		db.batch(data, callback);
	};
	var first = function(resource, callback){
		read(resource, { limit: 1 }, function(err, data){
			if(data.length === 1) return callback(null, data[0].key, data[0].value);
			callback(err);
		});
	};
	var importJSON = function(resource, payload, callback){
		var data = [];
		for(var itm in payload){
			payload[itm].key = resource ? resource + '!' + payload[itm].key : payload[itm].key;
			payload[itm].type = 'put'; 
			data.push(payload[itm]);
		}
		db.batch(data, callback);
	};
	var exportJSON = function(resource, callback){
		var elements = [];
		db.createReadStream()
			.on('data', function (element) {
				var store = element.key.substr(0, element.key.indexOf('!'));
				element.key = element.key.substr(element.key.indexOf('!')+1, element.key.length);
				if(!resource){
					elements.push(element);	
					element.store = store;			
				}
				if(resource && resource === store){
					elements.push(element);
				}
			})
			.on('error', function (err) {
				callback(err, undefined);
			})
			.on('close', function () {
			})
			.on('end', function () {
				callback(undefined, elements);
			});
	};
	var destroy = function(done){
		db.close();
		require('level')
			.destroy(config.dbPath, done);
	};
	var close = function(){
		db.close();
	};
	var repair = function(done){
		require('level')
			.repair(config.dbPath, done);
	};
	var statistics = function(done){
		db.approximateSize('!', '~', done);
	};
	var backup = function(done){
		if(!fs.existsSync(config.backupPath)) fs.mkdirSync(config.backupPath);
		var date = _toBackupFormat(new Date());
		var backupPath = path.join(config.backupPath, date);
		var dstdb = levelup(backupPath, {keyEncoding:'utf8', valueEncoding:'json'});
		db.createReadStream()
			.pipe(dstdb.createWriteStream())
			.on('error', function(error){
				done(error, null);
			})
			.on('close', function(){
				dstdb.close();
				done(null, date);
			});
	};
	var restore = function(name, done){
		var backupPath = path.join(config.backupPath, name);
		destroy(function(){
			var srcdb = levelup(backupPath, {keyEncoding:'utf8', valueEncoding:'json'});
			db = levelup(config.dbPath, {keyEncoding:'utf8', valueEncoding:'json'});
			srcdb.createReadStream()
				.pipe(db.createWriteStream())
				.on('error', function(error){
					done(error);
				})			
				.on('close', function(){
					srcdb.close();
					done(null);
				});
		});	
	};
	var onChange = function(callback){
		db.on('batch', function(arr){
			arr.forEach(function(item){
				callback({
					type: item.type,
					key: item.key,
					value: item.value
				});
			});
		});
		db.on('put', function(key, value){
			callback({
				type: 'put',
				key: key,
				value: value
			});
		});
		db.on('del', function(key){
			callback({
				type: 'del',
				key: key,
				value: undefined
			});
		});
	};

	fs.watchFile(config.rightsPath, function () {
		readRights();
	});
	readRights();

	return {
		getRights: function(){ return rights; },
		setPublic: setPublic,
		setPrivate: setPrivate,
		/**
		* List stores.
		* @memberOf module:store#
		* @method stores
		* @param {callback} callback
		*/
		stores: stores,
		/**
		* Gets items from a store.
		* @memberOf module:store#
		* @method read
		* @param {String} resource - Name of store.
		* @param {Object} options - Read options.
		* @param {callback} callback - Done handler.
		*/
		read: read,
		/**
		* Get items from a store by using a json query.
		* @memberOf module:store#
		* @method query		
		* @param {String} resource - Name of store.
		* @param {Object} options - Query options.
		* @param {String} queryString - JSON Query options.
		* @param {callback} callback - Done handler.
		*/
		query: query,
		/**
		* Add or change an item in a store.
		* @memberOf module:store#
		* @method upsert		
		* @param {String} resource - Name of store.
		* @param {String} key - Store item key.
		* @param {Object} payload - New data object.
		* @param {callback} callback - Done handler.
		*/
		upsert: upsert,
		/**
		* Remove an item from the store.
		* @memberOf module:store#
		* @method del
		* @param {String} resource - Name of store.
		* @param {String} key - Store item key.
		* @param {callback} callback - Done handler.
		*/
		del: del,
		/**
		* Bulk update (add, change, remove).
		* @memberOf module:store#
		* @method batch
		* @param {Array} data - Object array with store operations.
		* @param {callback} callback - Done handler.
		*/
		batch: batch,
		/**
		* Gets the first item in a store.
		* @memberOf module:store#
		* @method first
		* @param {String} resource - Name of store.
		* @param {callback} callback - Done handler.
		*/
		first: first,
		/**
		* Imports JSON data to a store.
		* @memberOf module:store#
		* @method imports
		* @param {String} resource - Name of store.
		* @param {Object} payload - JSON (array) to import.
		* @param {callback} callback - Done handler.
		*/
		imports: importJSON,
		/**
		* Exports store data as JSON.
		* @memberOf module:store#
		* @method exports		
		* @param {String} resource - Name of store.
		* @param {callback} callback - Done handler.
		*/
		exports: exportJSON,
		/**
		* Repair storage files.
		* @memberOf module:store#
		* @method repair
		* @param {callback} done
		*/
		repair: repair,
		/**
		* Backup storage files.
		* @memberOf module:store#
		* @method backup
		* @param {callback} done
		*/
		backup: backup,
		/**
		* Restore storage files.
		* @memberOf module:store#
		* @method restore
		* @param {String} name - Backup name.
		* @param {callback} done
		*/
		restore: restore,
		/**
		* Delete storage files.
		* @memberOf module:store#
		* @method destroy
		* @param {callback} done
		*/
		destroy: destroy,
		/**
		* Close the storage file handles.
		* @memberOf module:store#
		* @method close
		*/
		close: close,
		/**
		* Get storage statistics.
		* @memberOf module:store#
		* @method statistics
		* @param {callback} done
		*/
		statistics: statistics,
		/**
		* Store change notifications.
		* @memberOf module:store#
		* @method onChange
		* @param {callback} callback - Done handler.
		*/
		onChange: onChange
	};
};