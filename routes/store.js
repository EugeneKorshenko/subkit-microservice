'use strict';

module.exports.init = function(server, storage){

	server.get('/stores', function (req, res, next) {
		storage.stores(function(error, resourceKeys){
			if(error) { res.send(400, error); return next(); }
			res.send(resourceKeys);
			return next();
		});
	});
	server.get(/stores\/([a-zA-Z0-9!@_\.~-]+)(\/)?(.*)/, function (req, res, next) {
		var resource = req.params[0],
			key = req.params[2],
			from = req.params.from,
			limit = req.params.limit,
			keysOnly = req.params.keysOnly || req.params.keysOnly,
			cache = req.params.cache,
			groupBy = req.params.groupBy || req.params.groupby,
			reversed = req.params.reversed,
			where = req.params.where,
			page = req.params.page;

		if(resource === '') return res.send(400, new Error('Parameter not set'));

		var options = {
			cache: true,
			limit: 100
		};
		if(cache) options.cache = cache==='false' ? false : true;
		if(key) options.key = key;
		if(limit) options.limit = parseInt(limit);
		if(page) options.page = parseInt(page);
		if(from) options.from = from;
		if(reversed) options.reversed = reversed==='false' ? false : true;
		if(groupBy) options.groupBy = groupBy;
		if(keysOnly) options.keysOnly = keysOnly==='false' ? false : true;

		try { if(where) where = JSON.parse(unescape(where)); }catch(e){ where = {}; }

		storage.query(resource, options, where || {}, function(error, data){
			if(error) { res.send(400, error); return next(); }

			if(data.$version) res.header('ETag', data.$version);
			if(data.$timestamp) res.header('Last-Modified', data.$timestamp);
			res.send(data);
			return next();
		});		
	});
	server.post(/stores\/([a-zA-Z0-9!@_\.~-]+)(\/)?(.*)/, function (req, res, next) {
		var resource = req.params[0] || '';
		var key = req.params[2] || '';
		var payload = req.body;

		if(!resource) return res.send(400, new Error('Parameter `resource` missing'));
		if(!payload) return res.send(400, new Error('Parameter `payload` missing'));
		if(!resource.match(/^[0-9a-zA-Z_\-@!]+$/)) return res.send(400, new Error('Parameter `resource` mal formatted')); 
		if(key && !key.match(/^[0-9a-zA-Z_\-@!]+$/)) return res.send(400, new Error('Parameter `key` mal formatted')); 

		storage.insert(resource, key, payload, function(error, data){
			if(error) { res.send(400, error); return next(); }
			res.send(201, { message: 'created', $key:  data.key, $version: data.version, $timestamp: data.timestamp, $store: data.store });
			return next();
		});
	});
	server.put(/stores\/([a-zA-Z0-9!@_\.~-]+)\/(.*)/, function (req, res, next) {
		var resource = req.params[0] || '';
		var key = req.params[1] || '';
		var	payload = req.body;
		var ifMatch = parseInt(req.headers['if-match']);

		if(!resource) return res.send(400, new Error('Parameter `resource` missing'));
		if(!key) return res.send(400, new Error('Parameter `key` missing'));
		if(!payload) return res.send(400, new Error('Parameter `payload` missing'));

		var responseHandler = function(error, data){
			if(error && error.message.indexOf('Version conflict') !== -1) { res.send(412, error); return next(); }
			if(error && error.message.indexOf('Key not found') !== -1) { res.send(404, error); return next(); }
			if(error) { res.send(400, error); return next(); }
			res.send(202, { message: 'update accepted', $key:  data.key, $version: data.version, $timestamp: data.timestamp, $store: data.store });
			return next();
		};

		if(!ifMatch) storage.update(resource, key, payload, responseHandler);
		else storage.tryUpdate(resource, key, ifMatch, payload, responseHandler);
	});
	server.del(/stores\/([a-zA-Z0-9!@_\.~-]+)\/(.*)/, function (req, res, next) {
		var resource = req.params[0];
		var key = req.params[1];
		var ifMatch = parseInt(req.headers['if-match']);

		if(!resource) return res.send(400, new Error('Parameter `resource` missing'));
		if(!key) return res.send(400, new Error('Parameter `key` missing'));

		var responseHandler = function(error){
			if(error && error.message.indexOf('Version conflict') !== -1) { res.send(412, error); return next(); }
			if(error && error.message.indexOf('Key not found') !== -1) { res.send(404, error); return next(); }
			if(error) { res.send(400, error); return next(); }
			res.send(202, { message: 'delete accepted' });
			return next();
		};

		if(!ifMatch) storage.del(resource, key, responseHandler);
		else storage.tryDel(resource, key, ifMatch, responseHandler);
	});
	server.del(/stores\/([a-zA-Z0-9!@_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		if(!resource) return res.send(400, new Error('Parameter `resource` missing'));

		storage.del(resource, null, function(error){
			if(error) { res.send(400, error); return next(); }
			res.send(202, { message: 'delete accepted' });
			return next();
		});
	});
};