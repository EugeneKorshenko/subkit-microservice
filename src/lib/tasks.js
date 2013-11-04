var helper = require("./helper.js");

module.exports.init = function(server){
	//tasks
	//curl localhost:8080/tasks
	server.get("/tasks", helper.apiAuth, function(req,res,next){
		fs.readdir(storageModule.tasksPath, function(error, data){
			var result = [];
			data.forEach(function(itm){
				if(itm[0]!=="." && itm!=="README.txt") result.push(itm);
			});
			res.send(200, result);
		});
	});
	//curl -i -F filedata=@server.js http://localhost:8080/task/upload
	server.post("/task/upload", helper.userAuth, function (req, res, next) {
		if(!req.files) return res.send(400);

		var fileName = req.files.filedata.name,
			oldPath = req.files.filedata.path,
			newPath = path.join(storageModule.tasksPath, fileName);

		if(fs.statSync(oldPath).size > 100000) {
			fs.unlinkSync(oldPath);
			return res.send(400);
		}
		fs.renameSync(oldPath, newPath);
		return res.send(201);
	});
	//curl -X POST --data-binary @server.js http://localhost:8080/task/upload/server.js -H "Content-Type:application/octet-stream"
	server.post("/task/upload/:name", helper.userAuth, function (req, res, next) {
		if(!req.params.name) return res.send(400);
		
		var fileName = req.params.name,
			file = req.body.toString(),
			filePath = path.join(storageModule.tasksPath, fileName);
		
		if(file > 100000) return res.send(400);
		
		fs.writeFile(filePath, file, function(error, data){
			if(error) return res.send(400);
			res.send(200);
		});
	});
	//curl --upload server.js localhost:8080/task/upload/server.js
	//curl -X PUT --data-binary @server.js http://localhost:8080/task/upload/server.js -H "Content-Type:application/octet-stream"
	server.put("/task/upload/:name", helper.userAuth, function (req, res, next) {
		var fileName = req.params.name,
			file = req.body.toString();
		if(!fileName) return res.send(400);

		var filePath = path.join(storageModule.tasksPath, fileName);
		if(file > 100000){
			return res.send(400);
		}
		fs.writeFile(filePath, file, function(error, data){
			if(error) return res.send(400);
			res.send(200);
		});
	});
	//curl -O http://localhost:8080/task/download/demo.js
	server.get("/task/download/:name", helper.userAuth, function (req, res, next) {
		var fileName = req.params.name
			filePath = path.join(storageModule.tasksPath, fileName);

		fs.readFile(filePath, function(error, data){
			if(error) return res.send(404);
			res.setHeader('content-type', 'application/octet-stream');
			res.send(200, data.toString());
			return next();		
		});
	});
	//curl -X DELETE -i http://localhost:8080/task/myTask.js
	server.del("/task/:name", helper.userAuth, function(req, res, next){
		var fileName = req.params.name,
			filePath = path.join(storageModule.tasksPath, fileName);
		fs.unlink(filePath, function(error, data){
			if(error) return res.send(404);
			res.send(202);
			return next();
		});
	});
	//curl -X POST -d "log('bla');" localhost:8080/task/myTask.js -H "Content-Type:html/text"
	server.post("/task/:name", helper.userAuth, function(req, res, next){
		var fileName = req.params.name,
			file = req.body,
			filePath = path.join(storageModule.tasksPath, fileName);
		if(file > 100000) return res.send(400);

		fs.writeFile(filePath, file, function(error, data){
			if(error) return res.send(400);
			res.send(200);
		});
	});
	//curl -X PUT -d "log('bla2');" localhost:8080/task/myTask.js -H "Content-Type:html/text"
	server.put("/task/:name", helper.userAuth, function(req, res, next){
		var fileName = req.params.name,
			file = req.body,
			filePath = path.join(storageModule.tasksPath, fileName);
		if(file > 100000) return res.send(400);

		fs.writeFile(filePath, file, function(error, data){
			if(error) return res.send(400);
			res.send(200);
		});
	});

	//run tasks
	server.get(/run\/([a-zA-Z0-9_\.~-]+)/, helper.apiAuth, function (req, res, next) {
		var resource = req.params[0];
		storage.run(resource, req.params, function(error, data){
			if(error) return res.send(404, error);
			res.send(data);
			return next();
		});
	});
	server.post(/run\/([a-zA-Z0-9_\.~-]+)/, helper.apiAuth, function (req, res, next) {
		var resource = req.params[0];
		storage.run(resource, req.body || {}, function(error, data){
			if(error) return res.send(404, error);
			res.send(data);
			return next();
		});
	});
}