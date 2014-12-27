'use strict';

module.exports.init = function(doc){
	var stores_doc = doc('stores', 'Store operations.');
	stores_doc.models.Value = {
		id: 'Value',
		properties: {}
	};
	stores_doc.models.Info = {
		id: 'Info',
		properties: {
			name:{
				type: 'string'
			}
		}
	};
	stores_doc.get('/stores', 'List all stores.', {
		nickname: 'ReadStores',
		responseClass: 'List[Info]',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X GET {BASEURI}/stores',
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Server error'
			}
		]
	});
	stores_doc.get('/stores/{name}', 'Get items by store name.', {
	    nickname: 'FindAll',
		responseClass: 'List[Value]',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X GET {BASEURI}/stores/{name}',
	    parameters: [
	    	{name: 'name', description: 'Start letters of name of store.', required:true, dataType: 'string', paramType: 'path'},
	    	{name: 'keysOnly', description: 'Only get the keys.(default: false)', required:false, dataType: 'boolean', paramType: 'query'},
	    	{name: 'cache', description: 'Disable storage level caching. (default: true)', required:false, dataType: 'boolean', paramType: 'query'},
			{name: 'from', description: 'Start from a specified key. (default:"")', required:false, dataType: 'string', paramType: 'query'},
			{name: 'limit', description: 'Limit results within numeric number. (default: -1 max: 1000)', required:false, dataType: 'integer', paramType: 'query'},
			{name: 'filter', description: 'Filter results by JSON expression', required:false, dataType: 'string', paramType: 'query'},
	    ],
	    errorResponses:[
			{
				code: 400,
				message: 'Invalid request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Server error'
			}
		]
	});
	stores_doc.get('/stores/{name}/{key}', 'Get an item.', {
	    nickname: 'Find',
		responseClass: 'Value',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X GET {BASEURI}/stores/{name}/{key}',
		parameters: [
			{name: 'name', description: 'Name of store.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'key', description: 'Item key.', required:true, dataType: 'string', paramType: 'path'}
		],
	    errorResponses:[
			{
				code: 400,
				message: 'Invalid request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Server error'
			}
		]
	});
	stores_doc.post('/stores/{name}/{key}', 'Create an item in store.', {
		nickname: 'Create',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -d {"key":"value"} -X POST {BASEURI}/stores/{name}/{key}',
		parameters: [
			{name: 'name', description: 'Name of store.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'key', description: 'Item key.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'value', description: 'Item object.', required:true, dataType: 'Value', paramType: 'body'}
		],
	    errorResponses:[
			{
				code: 400,
				message: 'Invalid request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Server error'
			}
		]
	});
	stores_doc.put('/stores/{name}/{key}', 'Update an item in store.', {
		nickname: 'Update',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -d {"key":"value"} -X PUT {BASEURI}/stores/{name}/{key}',
		parameters: [
			{name: 'name', description: 'Name of store.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'key', description: 'Item key.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'value', description: 'Item object.', required:true, dataType: 'Value', paramType: 'body'}
		],
	    errorResponses:[
			{
				code: 400,
				message: 'Invalid request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Server error'
			}
		]
	});
	stores_doc.delete('/stores/{name}/{key}', 'Delete an item in store.', {
		nickname: 'Delete',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X DELETE {BASEURI}/stores/{name}/{key}',
		parameters: [
			{name: 'name', description: 'Name of store.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'key', description: 'Item key.', required:false, dataType: 'string', paramType: 'path'}
		],
	    errorResponses:[
			{
				code: 400,
				message: 'Invalid request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Server error'
			}
		]
	});
};