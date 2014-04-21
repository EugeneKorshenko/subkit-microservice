'use strict';

var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	jsonquery = require('jsonquery'),
	levelup = require('level');

var db,
	config,
	rights;

//rights
function writeRights(){
	fs.writeFileSync(config.rightsPath, JSON.stringify(rights));
}
function readRights(){
	var data = fs.readFileSync(config.rightsPath);
	rights = JSON.parse(data);
}
function setPublic(storeName, callback){
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
}
function setPrivate(storeName, callback){
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
}

//storage
function stores(callback){
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
}
function read(resource, options, callback){
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
			    	store:  desciptor,
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
				if(!error) callback(null, elements);
		  });
	}else{
		var resourceKey = resource + '!' + options.key;
		db.get(resourceKey, function (err, value) {
		  if (err) return callback(err, undefined);
		  callback(undefined, value);
		});
	}
}
function create(resource, key, payload, callback){
	db.put(resource + '!' + key, payload, {'sync' : false}, callback);
}
function update(resource, key, payload, callback){
	db.put(resource + '!' + key, payload, {'sync' : false}, callback);
}
function del(resource, key, callback){
	if(key) return db.del(resource + '!' + key, {'sync' : false}, callback);

	read(resource, {}, function(err, data){
		if(err) return callback(err);
		data.forEach(function(item){
			db.del(resource + '!' + item.key, {'sync' : false});
		});
		callback();
	});
}
function batch(data, callback){
	db.batch(data, callback);
}
function first(resource, callback){
	read(resource, { limit: 1 }, function(err, data){
		if(data.length === 1) return callback(null, data[0].key, data[0].value);
		callback(err);
	});
}

//manage
function imports(resource, payload, callback){
	var data = [];
	for(var itm in payload){
		payload[itm].key = resource ? resource + '!' + payload[itm].key : payload[itm].key;
		payload[itm].type = 'put'; 
		data.push(payload[itm]);
	}
	db.batch(data, callback);
}
function exports(resource, callback){
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

function backup(done){
	if(!fs.existsSync(config.backupPath)) fs.mkdirSync(config.backupPath);
	var date = toBackupFormat(new Date());
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
}
function restore(name, done){
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
}

//notification
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

//init
module.exports.init = function(conf){
	if(!conf) throw new Error('no conf');
	config = conf;

	db = levelup(config.dbPath, {keyEncoding:'utf8', valueEncoding:'json'});

	//rights file refresh on change
	fs.watchFile(config.rightsPath, function () {
		console.log('rights file changed - reload.');
		readRights();
	});

	//init
	readRights();

	return {
		getRights: function(){ return rights; },
		setPublic: setPublic,
		setPrivate: setPrivate,
		stores: stores,
		read: read,
		query: query,
		create: create,
		update: update,
		del: del,
		batch: batch,
		first: first,
		imports: imports,
		exports: exports,
		backup: backup,
		restore: restore,
		destroy: destroy,
		close: close,
		statistics: statistics,
		onChange: onChange
	};
};

function toBackupFormat(date) {
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