var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, task, helper){
	var maxSize = 100000;

	//run tasks
	server.get(/plugin\/run\/([a-zA-Z0-9_\.~-]+)/, helper.apiAuth, function (req, res, next) {
		var resource = req.params[0];
		task.run(resource, req.params, function(error, data){
			if(error) return res.send(404, error);
			res.send(data);
			return next();
		});
	});
	server.post(/plugin\/run\/([a-zA-Z0-9_\.~-]+)/, helper.apiAuth, function (req, res, next) {
		var resource = req.params[0];
		task.run(resource, req.body || {}, function(error, data){
			if(error) return res.send(404, error);
			res.send(data);
			return next();
		});
	});
}