'use strict';

module.exports.init = function(server, worker){

	server.get(/worker\/run\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		var timeOutRef = setTimeout(function(){
			return res.send(400, new Error(resource + ' do not done. Timeout.'));
		}, 60000);
		worker.run(resource, req.params, function(err, data, contentType, log){
			clearTimeout(timeOutRef);
			if(log) res.setHeader('Subkit-Log', JSON.stringify(log, null, 4));
			if(err) return res.send(400, err);

			res.setHeader('Content-Type', 'application/json');
			if(contentType) res.setHeader('Content-Type', contentType);
			res.send(200, data);
		});
	});

	server.put(/worker\/run\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		var timeOutRef = setTimeout(function(){
			return res.send(400, new Error(resource + ' do not done. Timeout.'));
		}, 60000);
		worker.run(resource, req.body, function(err, data, contentType, log){
			clearTimeout(timeOutRef);
			if(log) res.setHeader('Subkit-Log', JSON.stringify(log, null, 4));
			if(err) return res.send(400, err);

			res.setHeader('Content-Type', 'application/json');
			if(contentType) res.setHeader('Content-Type', contentType);
			res.send(200, data);
		});
	});

	server.post(/worker\/run\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		var timeOutRef = setTimeout(function(){
			return res.send(400, new Error(resource + ' do not done. Timeout.'));
		}, 60000);
		worker.run(resource, req.body, function(err, data, contentType, log){
			clearTimeout(timeOutRef);
			if(log) res.setHeader('Subkit-Log', JSON.stringify(log, null, 4));
			if(err) return res.send(400, err);

			res.setHeader('Content-Type', 'application/json');
			if(contentType) res.setHeader('Content-Type', contentType);
			res.send(200, data);
		});
	});

};
