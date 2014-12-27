'use strict';

module.exports.init = function(server, plugin, doc){
	require('./plugin.doc.js').init(doc);
	
	server.get('/plugins', function (req, res, next) {
		plugin.list(function(error, data){
			if(error) return res.send(400, error);
			res.send(200, data);
		});
	});
	server.post('/plugins/:name', function (req, res, next) {
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Parameter not set.'))

		plugin.add(name, function(error, data){
			if(error) return res.send(400, new Error('Plugin could not be installed.'));
			res.send(201, {message: 'installed'});
		});
	});
	server.del('/plugins/:name', function (req, res, next) {
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Parameter not set.'))

		plugin.remove(name, function(error, data){
			if(error) return res.send(400, new Error('Plugin could not be uninstalled.'));
			res.send(200, {message: 'uninstalled'});
		});
	});	

};