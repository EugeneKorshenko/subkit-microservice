'use strict';

module.exports.init = function(server, storage, doc){
	require('./doc/store.doc.js').init(doc);

	server.get('/stores', function (req, res, next) {
		storage.stores(function(error, resourceKeys){
			if(error) return next(error);
			res.send(resourceKeys);
			return next();
		});
	});
	server.get(/stores\/([a-zA-Z0-9_\.~-]+)(\/)?(.*)/, function (req, res, next) {
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

		if(resource === '') return res.send(404, new Error('Parameter not set.'));

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
			if(error) return next(error);

			if(data.$version) res.header('ETag', data.$version);
			if(data.$timestamp) res.header('Last-Modified', data.$timestamp);
			res.send(data);
			return next();
		});		
	});
	server.head(/stores\/([a-zA-Z0-9_\.~-]+)(\/)?(.*)/, function (req, res, next) {
		var resource = req.params[0],
			key = req.params[2];
		if(resource === '') return res.send(404, new Error('Parameter not set.'));
		res.send(200);
	});
	server.post(/stores\/([a-zA-Z0-9_\.~-]+)(\/)?(.*)/, function (req, res, next) {
		var resource = req.params[0];
		var key = req.params[2];
		var body = req.body;

		if(resource === '' || body === undefined) return res.send(404, new Error('Parameters not set.'));

		storage.insert(resource, key, body, function(error, data){
			if(error) return next(error);
			res.send(201, { message: 'created', key:  data.key});
			return next();
		});
	});
	server.put(/stores\/([a-zA-Z0-9_\.~-]+)\/(.*)/, function (req, res, next) {
		var resource = req.params[0];
		var key = req.params[1];
		var	body = req.body;
		var ifMatch = parseInt(req.headers['if-match']);

		if(resource === '' || key === ''  || body === undefined) return res.send(404, new Error('Parameters not set.'));

		var responseHandler = function(error){
			if(error && error.message === 'Version conflict.') return res.send(412, error);
			if(error && error.message === 'Not found.') return res.send(404, error);
			if(error) return next(error);
			res.send(202, { message: 'update accepted' });
			return next();
		};

		if(!ifMatch) storage.update(resource, key, body, responseHandler);
		else storage.tryUpdate(resource, key, ifMatch, body, responseHandler);
	});
	server.del(/stores\/([a-zA-Z0-9_\.~-]+)\/(.*)/, function (req, res, next) {
		var resource = req.params[0];
		var key = req.params[1];
		var ifMatch = parseInt(req.headers['if-match']);

		if(resource === '' || key === '') return res.send(404, new Error('Parameters not set.'));

		var responseHandler = function(error){
			if(error && error.message === 'Version conflict.') return res.send(412, error);
			if(error && error.message === 'Not found.') return res.send(404, error);			
			if(error) return next(error);
			res.send(202, { message: 'delete accepted' });
			return next();
		};

		if(!ifMatch) storage.del(resource, key, responseHandler);
		else storage.tryDel(resource, key, ifMatch, responseHandler);
	});
	server.del(/stores\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		if(resource === '') return res.send(404, new Error('Parameter not set.'));

		storage.del(resource, null, function(error){
			if(error) return next(error);
			res.send(202, { message: 'deleted accepted' });
			return next();
		});
	});
};