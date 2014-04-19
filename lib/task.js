'use strict';

var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, storage, tasksConfig, task, helper, doc){
	var maxSize = 100000;
	var file = require('./file-module.js').init(tasksConfig);

	var mr_doc = doc("task", "Run task operations.");
	mr_doc.models.Value = {
		id: "Value",
		properties: {}
	};
	mr_doc.get("/task/schema", "Load JSON schema for specified store name.", {
	    nickname: "getSchema",
		responseClass: "Value",
		parameters: [
			{name: "store", description: "Store name", required:true, dataType: "string", paramType: "query"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	mr_doc.get("/task/{name}", "Execute task script by name.", {
	    nickname: "run",
	    responseClass: "Value",
		parameters: [
			{name: "name", description: "Script name.", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	mr_doc.post("/task/{name}", "Execute task script by name.", {
	    nickname: "run",
	    responseClass: "Value",
		parameters: [
			{name: "name", description: "Script name.", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "Item object.", allowMultiple:true, required:true, dataType: "Value", paramType: "body"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});

	//start task scheduler
	task.scheduler.scheduleTasks();
	//start mapreduce tasks
	task.scheduler.scheduleMapReduce();	
	//start jobs scheduler
	task.scheduler.schedule({
		jobName: "periodic",
		cronTime: "* * * * *",
		payload: {name: "payload value"}
	});

	//curl localhost:8080/task
	server.get("/task", helper.apiAuth, function(req,res,next){
		file.readDir(tasksConfig.tasksPath, function(error, data){
			var result = [];
			data.forEach(function(itm){
				if(itm[0]!=="." && itm!=="README.txt") result.push(itm.replace(".js",""));
			});
			res.send(200, result);
		});
	});
	//curl -X POST --data-binary @demo.js http://localhost:8080/task/upload/demo.js -H "Content-Type:application/octet-stream"
	server.post("/task/upload/:name", helper.apiAuth, function (req, res, next) {
		if(!req.params.name) return res.send(400);
		var taskName = req.params.name+".js",
			fileData = req.body,
			filePath = path.join(tasksConfig.tasksPath, taskName);
		
		if(fileData > maxSize) return res.send(400);
		
		file.writeFile(filePath, fileData, function(error, data){
			if(error) return res.send(400);
			res.send(201);
		});
	});
	//curl --upload demo.js localhost:8080/task/upload/demo.js
	//curl -X PUT --data-binary @demo.js http://localhost:8080/task/upload/demo.js -H "Content-Type:application/octet-stream"
	server.put("/task/upload/:name", helper.apiAuth, function (req, res, next) {
		var taskName = req.params.name+".js",
			fileData = req.body;
		if(!taskName) return res.send(400);

		var filePath = path.join(tasksConfig.tasksPath, taskName);
		if(fileData > maxSize){
			return res.send(400);
		}
		file.writeFile(filePath, fileData, function(error, data){
			if(error) return res.send(400);
			res.send(201);
		});
	});
	//curl -O http://localhost:8080/task/download/demo.js
	server.get("/task/download/:name", helper.apiAuth, function (req, res, next) {
		var taskName = req.params.name+".js"
			filePath = path.join(tasksConfig.tasksPath, taskName);
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
	//curl -X DELETE -i http://localhost:8080/task/demo.js
	server.del("/task/:name", helper.apiAuth, function(req, res, next){
		var taskName = req.params.name+".js",
			filePath = path.join(tasksConfig.tasksPath, taskName);
		
		file.delFile(filePath, function(error, data){
			if(error) return res.send(404);
			res.send(202);
			return next();
		});
	});

	//run tasks
	server.get(/task\/run\/([a-zA-Z0-9_\.~-]+)/, helper.apiAuth, function (req, res, next) {
		var resource = req.params[0];
		task.runTask(resource, req.params, function(err, data){
			if(err) return next(new Error(err.message));
			res.send(200, data);
		});
	});
	server.post(/task\/run\/([a-zA-Z0-9_\.~-]+)/, helper.apiAuth, function (req, res, next) {
		var resource = req.params[0];
		task.runTask(resource, req.body || {}, function(err, data){
			if(err) return next(new Error(err.message));
			res.send(201, data);
		});
	});
	//schedule tasks
	server.post(/task\/schedule\/([a-zA-Z0-9_\.~-]+)/, helper.apiAuth, function (req, res, next) {
		var resource = req.params[0];
		var data = req.body || {};
		var time = data.time || Date.now() + 100;
		var payload = data.payload || {};

		var newJob = task.scheduler.newTask(time, payload, resource);
		task.scheduler.add(newJob);
		res.send(202, {status: "scheduled"});
	});
};