'use strict';

module.exports.init = function(server, event, logger){

	server.get('/streams/log', function(req, res){
		var where = req.params.where;
		var size = req.params.size;

		res.writeHead(200, {
			'Transfer-Encoding': 'chunked',
			'Content-Type': 'application/json'
		});
		logger
			.logStream(where, size)
			.pipe(res);
	});

	server.get('/streams/notify', function(req, res){
		var where = req.params.where;
		var size = req.params.size;

		res.writeHead(200, {
			'Transfer-Encoding': 'chunked',
			'Content-Type': 'application/json'
		});
		event
			.eventStream(where, size)
			.pipe(res);
	});
	
};