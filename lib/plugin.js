'use strict';

module.exports.init = function(server, plugin, doc){

	var plugin_doc = doc('plugins', 'Plugin operations.');
	plugin_doc.models.Value = {
		id: 'Value',
		properties: {
  		}
	};
	plugin_doc.get('/plugins', 'List available plugins.', {
	    nickname: 'listPlugins',
		responseClass: 'List[string]',
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});

	server.get('/plugins', function (req, res, next) {
		plugin.list(function(error, data){
			if(error) return res.send(500, 'List plugins error.');
			res.send(200, data);
		});
	});

};