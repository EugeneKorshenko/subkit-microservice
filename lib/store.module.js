'use strict';

var fs 			 = require('fs');
var path  		 = require('path');
var _ 			 = require('underscore');
var jsonquery	 = require('jsonquery');
var microtime	 = require('microtime');
var levelup		 = require('level');
var offsetStream = require('offset-stream');
var through      = require('ordered-through');
var fix          = require('level-fix-range');
var uuid 		 = require('node-uuid');
var utils 		 = require('./utils.module.js').init();

require('underscore-keypath');

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
	var db = levelup(config.dbPath, {keyEncoding:'utf8', valueEncoding:'json', cacheSize: 80 * 1024 * 1024});

	return {
		/**
		* List stores.
		* @memberOf module:store#
		* @method stores
		* @param {callback} callback
		*/
		stores: stores,
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
		* Add an item in a store.
		* @memberOf module:store#
		* @method insert		
		* @param {String} resource - Name of store.
		* @param {Object} payload - New data object.
		* @param {callback} callback - Done handler.
		*/
		insert: insert,
		/**
		* Update an item in a store.
		* @memberOf module:store#
		* @method update		
		* @param {String} resource - Name of store.
		* @param {String} key - Store item key.
		* @param {Object} payload - New data object.
		* @param {callback} callback - Done handler.
		*/
		update: update,		
		/**
		* Try to add or change an item in a store.
		* @memberOf module:store#
		* @method tryUpdate		
		* @param {String} resource - Name of store.
		* @param {String} key - Store item key.
		* @param {Number} version - Expected item version.
		* @param {Object} payload - New data object.
		* @param {callback} callback - Done handler.
		*/
		tryUpdate: tryUpdate,
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
		* Remove an item from the store.
		* @memberOf module:store#
		* @method del
		* @param {String} resource - Name of store.
		* @param {String} key - Store item key.
		* @param {Number} version - Expected item version.
		* @param {callback} callback - Done handler.
		*/
		tryDel: tryDel,		
		/**
		* Bulk update (add, change, remove).
		* @memberOf module:store#
		* @method batch
		* @param {Array} data - Object array with store operations.
		* @param {callback} callback - Done handler.
		*/
		batch: batch,
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

	function stores(callback){
		var resourceKeys = [];
		db.keyStream()
			.on('data', function (data) {
				var resourceKey = data.substr(0, data.indexOf('!'));
				if(!resourceKey) resourceKey = data;
				var isNotIncluded = _.filter(resourceKeys, function(item){ return item.$name  === resourceKey; }).length === 0;
				if(isNotIncluded) resourceKeys.push({
					$name: resourceKey
					// version: versions[resourceKey][resourceKey]
				});
			})
			.on('error', function (error) {
				return callback(error);
			})
			.on('close', function () {
			})
			.on('end', function () {
				callback(null, { results: resourceKeys });
			});
	}
	function query(resource, options, queryString, callback){
		if(!options) return callback(new Error('options parameter not defined.'));
		
		if(!options.key) {
			var elements = [];
			var error = null;
			options.limit = options.limit || -1;
			options.fillCache = options.cache || false;
			options.keys = options.keys || true;
			options.values = !options.keysOnly || true;
			options.valueEncoding = 'json';
			options.page = options.page || 0;

			if(options.from){
				options.start = (options.from.indexOf('!') === -1) ? resource + '!' + options.from + '!' : resource + '!' + options.from;
				options.end = resource + '!' + options.from + '~';
			} else {
				options.start = resource + '!';
				options.end = resource + '~';
			}
			var stream = (options.page) !== 0 ? _paginate(db, resource, { page : options.page, num : options.limit }) : db.readStream(options);
			stream
			.on('data', function (data) {
				var items = data.key.split('!');
				var desciptor = items.shift();
				var keyDescriptor = items.join('!');
				var element = {
					$name: desciptor,
					$store: desciptor,
					$key: keyDescriptor
				};

				element.$version = data.value.$version;
				delete data.value.$version;

				element.$timestamp = data.value.$timestamp;
				delete data.value.$timestamp;

			    if(!options.keysOnly) element.$payload = data.value;
			    try {
					if(jsonquery.match(element.$payload, queryString)) {
						if(options.reversed) elements.unshift(element);
						else elements.push(element);
					}
				}catch(e){}
			})
			.on('error', function (err) {
					error = err;
					callback(err);
			})
			.on('close', function () {
			})
			.on('end', function () {
				if(options.groupBy){
					var grouped = elements.reduce(function(previousValue, currentValue, index, array){			  				
							var groupKey = _(currentValue.$payload).valueForKeyPath(options.groupBy);
			  				if(!_.isArray(groupKey)){
			  					if(!previousValue[groupKey]) previousValue[groupKey] = [];
			  					if(jsonquery.match(currentValue.$payload, queryString)) previousValue[groupKey].push(currentValue);
							} else {
								if(jsonquery.match(currentValue.$payload, queryString)) {
				  					groupKey.forEach(function(subitm){
				  						if(!previousValue[subitm]) previousValue[subitm] = [];
				  						previousValue[subitm].push(currentValue);
				  					});
								}
							}
							return previousValue;
						}, {});
					if(!error) callback(null, grouped);
				}else{
					if(!error) callback(null, { results: elements });
				}
			});
		}else{
			db.get(resource + '!' + options.key, function(error, data){
				if(error) return callback(error);
				var element = {
					$name: resource,
					$store: resource,
					$key: options.key
				};

				element.$version = data.$version;
				delete data.$version;

				element.$timestamp = data.$timestamp;
				delete data.$timestamp;

			    if(!options.keysOnly) element.$payload = data;
			    callback(null, element);
			});
		}
	}
	function insert(resource, key, payload, callback){
		key = key || uuid.v1();

		payload.$version = microtime.now();
		payload.$timestamp = new Date().toISOString();
		db.put(resource + '!' + key, payload, {sync : true}, function(error, data){
			if(callback) callback(error, {key: key});
		});
	}	
	function update(resource, key, payload, callback){
		if(!resource) return callback(new Error('Parameter `resource` missing.'));
		if(!key) return callback(new Error('Parameter `key` missing.'));
		if(!payload) return callback(new Error('Parameter `payload` missing.'));

		payload.$version = microtime.now();
		payload.$timestamp = new Date().toISOString();
		db.put(resource + '!' + key, payload, {sync : true}, function(error, data){
			if(callback) callback(error, data);
		});
	}
	function tryUpdate(resource, key, version, payload, callback){
		if(!resource) return callback(new Error('Parameter `resource` missing.'));
		if(!key) return callback(new Error('Parameter `key` missing.'));
		if(!version) return callback(new Error('Parameter `version` missing.'));
		if(!payload) return callback(new Error('Parameter `payload` missing.'));
		if(!callback) return callback(new Error('Parameter `callback` missing.'));
		if(!_.isNumber(version)) return callback(new Error('Parameter `version` invalid.'));

		db.get(resource + '!' + key, function(err, data){
			if(err) return callback(err);
			if(!data) return callback(new Error('Not found.'));

			if(data && !data.$version){
				if(callback) return callback(new Error('Version conflict.'));
				return;
			}

			if(data.$version > version) {
				if(callback) return callback(new Error('Version conflict.'));
				return;
			}
			var newPayload = JSON.parse(JSON.stringify(payload));
			newPayload.$version = microtime.now();
			newPayload.$timestamp = new Date().toISOString();
			db.put(resource + '!' + key, newPayload, {sync : true}, function(error){
				if(callback) callback(error, newPayload);
			});
		});
	}
	function del(resource, key, callback){
		if(key) return db.del(resource + '!' + key, {sync : true}, callback);
		
		var c = 0;
		query(resource, {}, {}, function(err, data){
			if(err) return callback(err);
			var currentItems = data.results.length;
			if(currentItems === 0) return callback();

			data.results.forEach(function(item){
				db.del(resource + '!' + item.$key, {sync : true}, function(error, data){
					if(error) return callback(error);
					if(++c === currentItems) callback();
				});
			});			
		});
	}
	function tryDel(resource, key, version, callback){
		if(!resource) return callback(new Error('Parameter `resource` missing.'));
		if(!key) return callback(new Error('Parameter `key` missing.'));
		if(!version) return callback(new Error('Parameter `version` missing.'));
		if(!callback) return callback(new Error('Parameter `callback` missing.'));
		if(!_.isNumber(version)) return callback(new Error('Parameter `version` invalid.'));

		db.get(resource + '!' + key, function(err, data){
			if(err) return callback(err);
			if(!data) return callback(new Error('Not found.'));

			if(data && !data.$version){
				if(callback) return callback(new Error('Version conflict.'));
				return;
			}

			if(data.$version > version) {
				if(callback) return callback(new Error('Version conflict.'));
				return;
			}
			db.del(resource + '!' + key, {sync : true}, callback);
		});
	}
	function batch(data, callback){
		db.batch(data, callback);
	}
	function importJSON(resource, payload, callback){
		var data = [];
		for(var itm in payload){
			var element = payload[itm];
			if(!element.value || !element.key) return callback(new Error('Unsupported format'));
			if(!resource && !element.store) return callback(new Error('Resource not found'));

			element.key = resource ? resource + '!' + element.key : element.store + '!' + element.key;
			element.type = 'put';
			if(!element.value.$version) element.value.$version = microtime.now();
			if(!element.value.$timestamp) element.value.$timestamp = new Date().toISOString();
			data.push(element);
		}
		db.batch(data, callback);
	}
	function exportJSON(resource, callback){
		var elements = [];
		db.createReadStream()
			.on('data', function (element) {
				var store = element.key.substr(0, element.key.indexOf('!'));
				element.key = element.key.substr(element.key.indexOf('!')+1, element.key.length);
				if(!resource){
					element.store = store;
					elements.push(element);	
				}
				if(resource && resource === store){
					elements.push(element);
				}
			})
			.on('error', function (err) {
				callback(err);
			})
			.on('close', function () {
			})
			.on('end', function () {
				callback(null, elements);
			});
	}
	function destroy(done){
		db.close();
		require('level')
			.destroy(config.dbPath, done);
	}
	function close(){
		db.close();
	}
	function repair(done){
		require('level')
			.repair(config.dbPath, done);
	}
	function statistics(done){
		db.approximateSize('!', '~', done);
	}
	function backup(name, done){
		if(name instanceof Function) {
			done = name;
			name = new Date();
		}
		var date = _toBackupFormat(name);

		if(!fs.existsSync(config.backupPath)) fs.mkdirSync(config.backupPath);
		
		var backupPath = path.join(config.backupPath, date, 'masterdb');
		if(!fs.existsSync(backupPath)) utils.mkdirRecursive(backupPath);

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
	}
	function restore(name, done){
		var backupPath = path.join(config.backupPath, name, 'masterdb');
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
	}
	function onChange(callback){
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
	}

	function _paginate(db, prefix, opts) {
		if (!opts) opts = {};
		if (!opts.page) opts.page = 0;
		if (!opts.num) opts.num = 10;
		var offset = opts.page * opts.num;
		var limit = offset + opts.num;

		return db.createReadStream(fix({
			reverse : false,
			start   : prefix + '!',
			end     : prefix + '~',
			limit   : limit
			}))
			.pipe(offsetStream(offset));
	}
	function _toBackupFormat(date) {
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
	}

};