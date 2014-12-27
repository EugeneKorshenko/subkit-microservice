'use strict';

module.exports.init = function(server, storage, doc){
	require('./store.doc.js').init(doc);

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
			keysOnly = req.params.keysOnly,
			cache = req.params.cache,
			groupingKey = req.params.groupingKey,
			filter = req.params.filter;

		if(resource === '') return res.send(404, new Error('Parameter not set.'));

		var options = {
			cache: true,
			limit: 1000
		};
		if(cache) options.cache = cache==='false' ? false : true;
		if(key) options.key = key;
		if(limit) options.limit = parseInt(limit);
		if(from) options.from = from;
		if(groupingKey) options.groupingKey = groupingKey;
		if(keysOnly) options.keysOnly = keysOnly==='false' ? false : true;

		try { if(filter) filter = JSON.parse(unescape(filter)); }catch(e){}

		storage.query(resource, options, filter || {}, function(error, data){
			if(error) return next(error);
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
		var payload = req.body;

		if(resource === '' || payload === undefined) return res.send(404, new Error('Parameters not set.'));

		storage.insert(resource, key, payload, function(error, data){
			if(error) return next(error);
			res.send(201, { message: 'created', key:  data.key});
			return next();
		});
	});
	server.put(/stores\/([a-zA-Z0-9_\.~-]+)\/(.*)/, function (req, res, next) {
		var resource = req.params[0];
		var key = req.params[1];
		var	payload = req.body;

		if(resource === '' || key === ''  || payload === undefined) return res.send(404, new Error('Parameters not set.'));

		storage.update(resource, key, payload, function(error){
			if(error) return next(error);
			res.send(202, { message: 'created' });
			return next();
		});
	});
	server.del(/stores\/([a-zA-Z0-9_\.~-]+)\/(.*)/, function (req, res, next) {
		var resource = req.params[0],
			key = req.params[1];

		if(resource === '' || key === '') return res.send(404, new Error('Parameters not set.'));

		storage.del(resource, key, function(error){
			if(error) return next(error);
			res.send(202, { message: 'accepted' });
			return next();
		});
	});
	server.del(/stores\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		if(resource === '') return res.send(404, new Error('Parameter not set.'));

		storage.del(resource, null, function(error){
			if(error) return next(error);
			res.send(202, { message: 'accepted' });
			return next();
		});
	});
};