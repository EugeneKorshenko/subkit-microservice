'use strict';

module.exports.init = function(doc){

	var plugin_doc = doc('plugins', 'Plugin operations.');
	plugin_doc.models.Value = {
		id: 'Value',
		properties: {
  		}
	};
	plugin_doc.get('/manage/plugins', 'List available plugins.', {
	    nickname: 'listPlugins',
		responseClass: 'List[string]',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X GET {BASEURI}/manage/plugins',
		parameters: [],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});
	plugin_doc.put('/manage/plugins/{name}', 'Add a plugin.', {
		nickname: 'addPlugin',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X POST {BASEURI}/manage/plugins/{name}',
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
	plugin_doc.delete('/manage/plugins/{name}', 'Remove a plugin.', {
		nickname: 'removePlugin',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X DELETE {BASEURI}/manage/plugins/{name}',
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