'use strict';

module.exports.init = function(server, logger){
	server.get('/streams/log', function(req, res){
		var where = req.params.where;

		res.writeHead(200, {
			'Transfer-Encoding': 'chunked',
			'Content-Type': 'application/json'
		});
		logger
			.logStream(where)
			.pipe(res);
	});

	server.get('/streams/notify', function(req, res){
		var where = req.params.where;

		res.writeHead(200, {
			'Transfer-Encoding': 'chunked',
			'Content-Type': 'application/json'
		});
		logger
			.logStream(where)
			.pipe(res);
	});
};