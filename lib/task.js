var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, storage, tasksConfig, task, helper){
	var maxSize = 100000;
	var file = require('./file-module.js').init(tasksConfig);
	
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

	//curl -X POST --data-binary @demo.js http://localhost:8080/task/upload/demo.js -H "Content-Type:application/octet-stream"
	server.post("/task/upload/:name", helper.apiAuth, function (req, res, next) {
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
	//curl --upload demo.js localhost:8080/task/upload/demo.js
	//curl -X PUT --data-binary @demo.js http://localhost:8080/task/upload/demo.js -H "Content-Type:application/octet-stream"
	server.put("/task/upload/:name", helper.apiAuth, function (req, res, next) {
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
	//curl -O http://localhost:8080/task/download/demo.js
	server.get("/task/download/:name", helper.apiAuth, function (req, res, next) {
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
	//curl -X DELETE -i http://localhost:8080/task/demo.js
	server.del("/task/:name", helper.apiAuth, function(req, res, next){
		var taskName = req.params.name+".js",
			filePath = path.join(tasksConfig.filesPath, taskName);
		
		file.delFile(filePath, function(error, data){
			if(error) return res.send(404);
			res.send(202);
			return next();
		});
	});

	//run tasks
	server.get(/task\/run\/([a-zA-Z0-9_\.~-]+)/, helper.apiAuth, function (req, res, next) {
		var resource = req.params[0];
		task.run(resource, req.params, function(error, data){
			if(error) return res.send(404, error);
			res.send(data);
			return next();
		});
	});
	server.post(/task\/run\/([a-zA-Z0-9_\.~-]+)/, helper.apiAuth, function (req, res, next) {
		var resource = req.params[0];
		task.run(resource, req.body || {}, function(error, data){
			if(error) return res.send(404, error);
			res.send(data);
			return next();
		});
	});
}