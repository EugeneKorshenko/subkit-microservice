'use strict';

module.exports.init = function(server, task, doc){
	require('./task.doc.js').init(doc);

	//settings
	server.get('/tasks/settings', function(req,res,next){
		res.send(200, {});
	});

	//operations
	server.get('/tasks', function(req,res,next){
		task.list(function(error, data){
			if(error) return res.send(400, new Error('Task error.'));
			res.send(200, {results: data});
		});
	});
	server.get('/tasks/:name', function (req, res, next) {
		var taskName = req.params.name;
			task.get(taskName, function(error, data){
				if(error) return res.send(400, new Error('Task error.'));
				res.send(200, data);
			});
	});
	server.post('/tasks/:name', function(req, res, next){
		var taskName = req.params.name,
			taskScript = req.body;

		if(!taskName) return res.send(400, new Error('Task error.'));
		if(!taskScript) taskScript = new task.Task(taskName);

		task.set(taskName, taskScript, function(error, data){
			if(error) return res.send(400, new Error('Task error.'));
			res.send(201, { message: 'created'});
		});
	});
	server.put('/tasks/:name', function (req, res, next) {
		var taskName = req.params.name,
			taskScript = req.body;

		if(!taskName) return res.send(400, new Error('Task error.'));
		if(!taskScript) taskScript = new task.Task(taskName);

		task.set(taskName, taskScript, function(error, data){
			if(error) return res.send(400, new Error('Task error.'));
			res.send(200, {message: 'changed'});
		});
	});
	server.del('/tasks/:name', function(req, res, next){
		var taskName = req.params.name;
		task.remove(taskName,function(error, data){
			if(error) return res.send(400, new Error('Task error.'));
			res.send(200, {message: 'removed'});
		});
	});

	server.get(/tasks\/action\/run\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		var timeOutRef = setTimeout(function(){
			return res.send(400, new Error(resource + ' do not done. Timeout.'));
		}, 5000);
		task.run(resource, req.params, { request: req, response: res }, function(err, data, contentType, log){
			clearTimeout(timeOutRef);
			try{
				if(log) res.setHeader('Subkit-Log', JSON.stringify(log, null, 4));
				if(err) return res.send(400, err);
				if(contentType) res.setHeader('Content-Type', contentType);
				res.send(200, data);
			}catch(e){}
		});
	});
	server.put(/tasks\/action\/run\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		var timeOutRef = setTimeout(function(){
			return res.send(400, new Error(resource + ' do not done. Timeout.'));
		}, 5000);
		task.run(resource, req.body, { request: req, response: res }, function(err, data, contentType, log){
			clearTimeout(timeOutRef);
			try{
				if(log) res.setHeader('Subkit-Log', JSON.stringify(log, null, 4));
				if(err) return res.send(400, err);
				if(contentType) res.setHeader('Content-Type', contentType);
				res.send(200, data);
			}catch(e){}				
		});
	});
	server.post(/tasks\/action\/run\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		var timeOutRef = setTimeout(function(){
			return res.send(400, new Error(resource + ' do not done. Timeout.'));
		}, 5000);
		task.run(resource, req.body, { request: req, response: res }, function(err, data, contentType, log){
			clearTimeout(timeOutRef);
			try{			
				if(log) res.setHeader('Subkit-Log', JSON.stringify(log, null, 4));
				if(err) return res.send(400, err);
				if(contentType) res.setHeader('Content-Type', contentType);
				res.send(200, data);
			}catch(e){}
		});
	});

};
