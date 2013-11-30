var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, storage, tasksConfig, task, helper){
	var maxSize = 100000;
	var file = require('./file-module.js').init(tasksConfig);

	//start task scheduler
	task.scheduler.scheduleTasks();

	//start jobs scheduler
	var generateKey = function(){ return Date.now() + '!' + Math.random().toString(16).slice(2); };
	var scheduled1 = task.scheduler.schedule({
		jobName: "periodic",
		cronTime: "* * * * *",
		payload: {name: "payload value"}
	}, generateKey());

	//tasks
	//curl localhost:8080/tasks
	server.get("/tasks", helper.apiAuth, function(req,res,next){
		file.readDir(tasksConfig.filesPath, function(error, data){
			var result = [];
			data.forEach(function(itm){
				if(itm[0]!=="." && itm!=="README.txt") result.push(itm.replace(".js",""));
			});
			res.send(200, result);
		});
	});
	//curl -X POST --data-binary @demo.js http://localhost:8080/tasks/upload/demo.js -H "Content-Type:application/octet-stream"
	server.post("/tasks/upload/:name", helper.apiAuth, function (req, res, next) {
		if(!req.params.name) return res.send(400);
		var taskName = req.params.name+".js",
			fileData = req.body,
			filePath = path.join(tasksConfig.filesPath, taskName);
		
		if(fileData > maxSize) return res.send(400);
		
		file.writeFile(filePath, fileData, function(error, data){
			if(error) return res.send(400);
			res.send(201);
		});
	});
	//curl --upload demo.js localhost:8080/tasks/upload/demo.js
	//curl -X PUT --data-binary @demo.js http://localhost:8080/tasks/upload/demo.js -H "Content-Type:application/octet-stream"
	server.put("/tasks/upload/:name", helper.apiAuth, function (req, res, next) {
		var taskName = req.params.name+".js",
			fileData = req.body;
		if(!taskName) return res.send(400);

		var filePath = path.join(tasksConfig.filesPath, taskName);
		if(fileData > maxSize){
			return res.send(400);
		}
		file.writeFile(filePath, fileData, function(error, data){
			if(error) return res.send(400);
			res.send(201);
		});
	});
	//curl -O http://localhost:8080/tasks/download/demo.js
	server.get("/tasks/download/:name", helper.apiAuth, function (req, res, next) {
		var taskName = req.params.name+".js"
			filePath = path.join(tasksConfig.filesPath, taskName);
		file.readFile(filePath, function(error, data){
			if(error) return res.send(404);
			if(taskName.indexOf('.plist') !== -1){
				res.setHeader('Content-Type', 'text/xml');
			}
			else{
				res.setHeader('Content-Type', 'application/octet-stream');
			}
			res.write(data);
			res.end();
			return next();		
		});
	});
	//curl -X DELETE -i http://localhost:8080/tasks/demo.js
	server.del("/tasks/:name", helper.apiAuth, function(req, res, next){
		var taskName = req.params.name+".js",
			filePath = path.join(tasksConfig.filesPath, taskName);
		
		file.delFile(filePath, function(error, data){
			if(error) return res.send(404);
			res.send(202);
			return next();
		});
	});

	//run tasks
	server.get(/tasks\/run\/([a-zA-Z0-9_\.~-]+)/, helper.apiAuth, function (req, res, next) {
		var resource = req.params[0];
		task.runTask(resource, req.params, function(err, data){
			if(err) return next(new Error(err.message));
			res.send(200, data);
		});
	});
	server.post(/tasks\/run\/([a-zA-Z0-9_\.~-]+)/, helper.apiAuth, function (req, res, next) {
		var resource = req.params[0];
		task.runTask(resource, req.body || {}, function(err, data){
			if(err) return next(new Error(err.message));
			res.send(201, data);
		});
	});

	//schedule tasks
	server.post(/tasks\/schedule\/([a-zA-Z0-9_\.~-]+)/, function (req, res, next) {
		var resource = req.params[0];
		var data = req.body || {};

		var time = data.time || Date.now() + 100;
		var payload = data.payload || {};

		var newJob = task.scheduler.newTask(time, payload, resource);
		task.scheduler.add(newJob);
		res.send(202, {status: "scheduled"});
	});
}