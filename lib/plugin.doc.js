'use strict';

module.exports.init = function(doc){

	var plugin_doc = doc('plugins', 'Plugin operations.');
	plugin_doc.models.Value = {
		id: 'Value',
		properties: {
  		}
	};
	plugin_doc.get('/plugins', 'List available plugins.', {
	    nickname: 'listPlugins',
		responseClass: 'List[string]',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X GET {BASEURI}/plugins',
		parameters: [],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});
	plugin_doc.post('/plugins/{name}', 'Add a plugin.', {
		nickname: 'addPlugin',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X POST {BASEURI}/plugins/{name}',
		parameters: [
			{name: 'name', description: 'Name of plugin.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});
	plugin_doc.delete('/plugins', 'Remove a plugin.', {
		nickname: 'removePlugin',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X DELETE {BASEURI}/plugins/{key}',
		parameters: [
			{name: 'name', description: 'Name of plugin.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});
};