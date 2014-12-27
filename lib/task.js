'use strict';

module.exports.init = function(server, task, doc){
	require('./task.doc.js').init(doc);

	server.get(/tasks\/action\/run\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		var timeOutRef = setTimeout(function(){
			return res.send(400, new Error(resource + ' do not done. Timeout.'));
		}, 60000);
		task.run(resource, req.params, function(err, data, contentType, log){
			clearTimeout(timeOutRef);
			if(log) res.setHeader('Subkit-Log', JSON.stringify(log, null, 4));
			if(err) return res.send(400, err);

			res.setHeader('Content-Type', 'application/json');
			if(contentType) res.setHeader('Content-Type', contentType);
			res.send(200, data);
		});
	});

	server.put(/tasks\/action\/run\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		var timeOutRef = setTimeout(function(){
			return res.send(400, new Error(resource + ' do not done. Timeout.'));
		}, 60000);
		task.run(resource, req.body, function(err, data, contentType, log){
			clearTimeout(timeOutRef);
			if(log) res.setHeader('Subkit-Log', JSON.stringify(log, null, 4));
			if(err) return res.send(400, err);

			res.setHeader('Content-Type', 'application/json');
			if(contentType) res.setHeader('Content-Type', contentType);
			res.send(200, data);
		});
	});

	server.post(/tasks\/action\/run\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		var timeOutRef = setTimeout(function(){
			return res.send(400, new Error(resource + ' do not done. Timeout.'));
		}, 60000);
		task.run(resource, req.body, function(err, data, contentType, log){
			clearTimeout(timeOutRef);
			if(log) res.setHeader('Subkit-Log', JSON.stringify(log, null, 4));
			if(err) return res.send(400, err);

			res.setHeader('Content-Type', 'application/json');
			if(contentType) res.setHeader('Content-Type', contentType);
			res.send(200, data);
		});
	});

};
