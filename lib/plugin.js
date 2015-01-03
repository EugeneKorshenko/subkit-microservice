'use strict';

module.exports.init = function(server, plugin, doc){
	require('./plugin.doc.js').init(doc);
	
	server.get('/manage/plugins', function (req, res, next) {
		plugin.list(function(error, data){
			if(error) return res.send(400, error);
			res.send(200, data);
		});
	});
	server.put('/manage/plugins/:name', function (req, res, next) {
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));
		if(name.indexOf("subkit-") === -1 || name.indexOf("-plugin") === -1) return res.send(400, new Error('Plugin could not be installed.'));

		plugin.add(name, function(error, data){
			if(error) return res.send(400, new Error('Plugin could not be installed.'));
			res.send(201, {message: 'installed'});
		});
	});
	server.del('/manage/plugins/:name', function (req, res, next) {
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));
		if(name.indexOf("subkit-") === -1 || name.indexOf("-plugin") === -1) return res.send(400, new Error('Plugin could not be uninstalled.'));

		plugin.remove(name, function(error, data){
			if(error) return res.send(400, new Error('Plugin could not be uninstalled.'));
			res.send(200, {message: 'uninstalled'});
		});
	});	

};