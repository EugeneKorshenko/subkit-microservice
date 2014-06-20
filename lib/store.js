'use strict';

module.exports.init = function(server, storage, doc){
	var stores_doc = doc('stores', 'Store operations.');
	stores_doc.models.Value = {
		id: 'Value',
		properties: {}
	};
	stores_doc.models.Info = {
		id: 'Info',
		properties: {
			grant:{
				type: 'bool'
			},
			name:{
				type: 'string'
			}
		}
	};
	stores_doc.get('/stores', 'List all stores.', {
		nickname: 'ReadStores',
		responseClass: 'List[Info]',
		errorResponses:[
			{
				code: 401,
				message: 'Unauthorized request.'
			}
		]
	});
	stores_doc.get('/stores/{name}', 'Gets all items by store name.', {
	    nickname: 'FindAll',
		responseClass: 'List[Value]',
	    parameters: [
	    	{name: 'name', description: 'Start letters of name of store.', required:true, dataType: 'string', paramType: 'path'},
	    	{name: 'keysOnly', description: 'Only get the keys.(default: false)', required:false, dataType: 'boolean', paramType: 'query'},
	    	{name: 'cache', description: 'Disable storage level caching. (default: true)', required:false, dataType: 'boolean', paramType: 'query'},
			{name: 'from', description: 'Start from a specified key. (default:"")', required:false, dataType: 'string', paramType: 'query'},
			{name: 'limit', description: 'Limit results within numeric number. (default: -1)', required:false, dataType: 'integer', paramType: 'query'},
			{name: 'filter', description: 'Filter results by JSON expression', required:false, dataType: 'string', paramType: 'query'},
	    ],
	    errorResponses:[
			{
				code: 400,
				message: 'Invalid parameter format.'
			},
			{
				code: 401,
				message: 'Unauthorized request.'
			},
			{
				code: 404,
				message: 'Invalid parameter format.'
			}
		]
	});
	stores_doc.get('/stores/{name}/{key}', 'Gets an item.', {
	    nickname: 'Find',
		responseClass: 'Value',
		parameters: [
			{name: 'name', description: 'Name of store.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'key', description: 'Item key.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Invalid parameter format.'
			},
			{
				code: 401,
				message: 'Unauthorized request.'
			},
			{
				code: 404,
				message: 'Invalid parameter format.'
			}
		]
	});
	stores_doc.post('/stores/{name}/{key}', 'Create an item in store.', {
		nickname: 'Create',
		responseClass: 'void',
		parameters: [
			{name: 'name', description: 'Name of store.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'key', description: 'Item key.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'value', description: 'Item object.', required:true, dataType: 'Value', paramType: 'body'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Invalid parameter format.'
			},
			{
				code: 401,
				message: 'Unauthorized request.'
			},
			{
				code: 404,
				message: 'Invalid parameter format.'
			}
		]
	});
	stores_doc.put('/stores/{name}/{key}', 'Update an item in store.', {
		nickname: 'Update',
		responseClass: 'void',
		parameters: [
			{name: 'name', description: 'Name of store.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'key', description: 'Item key.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'value', description: 'Item object.', required:true, dataType: 'Value', paramType: 'body'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Invalid parameter format.'
			},
			{
				code: 401,
				message: 'Unauthorized request.'
			},
			{
				code: 404,
				message: 'Invalid parameter format.'
			}
		]
	});
	stores_doc.delete('/stores/{name}/{key}', 'Delete an item in store.', {
		nickname: 'Delete',
		responseClass: 'void',
		parameters: [
			{name: 'name', description: 'Name of store.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'key', description: 'Item key.', required:false, dataType: 'string', paramType: 'path'}
		],
    	errorResponses:[
			{
				code: 400,
				message: 'Invalid parameter format.'
			},
			{
				code: 401,
				message: 'Unauthorized request.'
			},
			{
				code: 404,
				message: 'Invalid parameter format.'
			}
		]
	});

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
			filter = req.params.filter;

		if(resource === '') return res.send(404, new Error('Parameter not set.'));

		var options = {
			cache: true
		};
		if(cache) options.cache = cache==='false' ? false : true;
		if(key) options.key = key;
		if(limit) options.limit = parseInt(limit);
		if(from) options.from = from;
		if(keysOnly) options.keysOnly = keysOnly==='false' ? false : true;

		try { if(filter) filter = JSON.parse(unescape(filter)); }catch(e){}

		if(filter){
			storage.query(resource, options, filter, function(error, data){
				if(error) return next(error);
				res.send(data);
				return next();
			});		
		}else{
			storage.read(resource, options, function(error, data){
				if(error) return next(error);
				res.send(data);
				return next();
			});			
		}
	});
	server.head(/stores\/([a-zA-Z0-9_\.~-]+)(\/)?(.*)/, function (req, res, next) {
		var resource = req.params[0],
			key = req.params[2];
		if(resource === '') return res.send(404, new Error('Parameter not set.'));
		res.send(200);
	});
	server.post(/stores\/([a-zA-Z0-9_\.~-]+)\/(.*)/, function (req, res, next) {
		var resource = req.params[0],
			key = req.params[1],
			payload = req.body;

		if(resource === '' || key === '' || payload === undefined) return res.send(404, new Error('Parameters not set.'));

		storage.upsert(resource, key, payload, function(error){
			if(error) return next(error);
			res.send(201, { status: 'created' });
			return next();
		});
	});
	server.put(/stores\/([a-zA-Z0-9_\.~-]+)\/(.*)/, function (req, res, next) {
		var resource = req.params[0],
			key = req.params[1],
			payload = req.body;

		if(resource === '' || key === ''  || payload === undefined) return res.send(404, new Error('Parameters not set.'));

		storage.upsert(resource, key, payload, function(error){
			if(error) return next(error);
			res.send(202, { status: 'created' });
			return next();
		});
	});
	server.del(/stores\/([a-zA-Z0-9_\.~-]+)\/(.*)/, function (req, res, next) {
		var resource = req.params[0],
			key = req.params[1];

		if(resource === '' || key === '') return res.send(404, new Error('Parameters not set.'));

		storage.del(resource, key, function(error){
			if(error) return next(error);
			res.send(202, { status: 'accepted' });
			return next();
		});
	});
	server.del(/stores\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		if(resource === '') return res.send(404, new Error('Parameter not set.'));

		storage.del(resource, null, function(error){
			if(error) return next(error);
			res.send(202, { status: 'accepted' });
			return next();
		});
	});
};