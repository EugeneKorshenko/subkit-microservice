'use strict';

module.exports.init = function(server, task, doc){
	require('./doc/task.doc.js').init(doc);

	//operations
	server.get('/tasks', function(req,res,next){
		task.list(function(error, data){
			if(error) return next(400, new Error('Task error.'));
			res.send(200, {results: data});
			next();
		});
	});
	server.get('/tasks/:name', function (req, res, next) {
		var taskName = req.params.name;
		if(!taskName) return next(400, new Error('Task `name` missing.'));

		task.get(taskName, function(error, data){
			if(error) return next(400, new Error('Task error.'));
			res.send(200, data);
			next();
		});
	});
	server.post('/tasks/:name', function(req, res, next){
		var taskName = req.params.name;
		if(!taskName) return next(400, new Error('Task `name` missing.'));

		var newTask = new task.Task(taskName);
		newTask.taskScript = req.body.taskScript;
		newTask.description = req.body.description;
		newTask.schedule = req.body.schedule;
		newTask.continuous = req.body.continuous;
		newTask.parameters = req.body.parameters;
		
		task.set(taskName, newTask, function(error){
			if(error) return next(400, new Error('Task error.'));
			res.send(201, { message: 'created'});
			next();
		});
	});
	server.put('/tasks/:name', function (req, res, next) {
		var taskName = req.params.name;
		if(!taskName) return next(400, new Error('Task `name` missing.'));

		var newTask = new task.Task(taskName);
		newTask.taskScript = req.body.taskScript;
		newTask.description = req.body.description;
		newTask.schedule = req.body.schedule;
		newTask.continuous = req.body.continuous;
		newTask.parameters = req.body.parameters;

		task.set(taskName, newTask, function(error){
			if(error) return next(400, new Error('Task error.'));
			res.send(202, {message: 'update accepted'});
			next();
		});
	});
	server.del('/tasks/:name', function(req, res, next){
		var taskName = req.params.name;
		if(!taskName) return next(400, new Error('Task `name` missing.'));

		task.remove(taskName, function(error){
			if(error) return next(400, new Error('Task error.'));
			res.send(202, {message: 'delete accepted'});
			next();
		});
	});

	function apiHandler(req, res, next) {
		req.params['1'] = req.params['2'];
		delete req.params[2];

		var timeOutRef = setTimeout(function(){
			return next(400, new Error(resource + ' do not done. Timeout.'));
		}, 2500);
		
		var resource = req.params[0];
		task.run(resource, req.params || req.body || {}, { request: req, response: res }, function(err, data, contentType, log){
			clearTimeout(timeOutRef);
			try{			
				if(log) res.setHeader('Subkit-Log', JSON.stringify(log, null, 4));
				if(err) return next(400, err);
				if(contentType) res.setHeader('Content-Type', contentType);
				res.send(200, data);
				next();
			}catch(e){}
		});
	}
	server.get(/api\/([a-zA-Z0-9_\.~-]+)(\/)?(.*)/, apiHandler);
	server.head(/api\/([a-zA-Z0-9_\.~-]+)(\/)?(.*)/, apiHandler);
	server.post(/api\/([a-zA-Z0-9_\.~-]+)(\/)?(.*)/, apiHandler);
	server.put(/api\/([a-zA-Z0-9_\.~-]+)(\/)?(.*)/, apiHandler);
	server.del(/api\/([a-zA-Z0-9_\.~-]+)(\/)?(.*)/, apiHandler);
};
