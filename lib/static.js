var path = require("path"),
	fs = require("fs");

module.exports.init = function(server, config, helper){
	var maxSize = 1000000000;
	var file = require('./file-module.js').init(config);

	//statics
	//curl localhost:8080/statics
	server.get("/statics", helper.apiAuth, function(req,res,next){
		file.readDir(config.filesPath, function(error, data){
			var result = [];
			data.forEach(function(itm){
				if(itm[0]!=="." && itm!=="README.txt") result.push(itm);
			});
			res.send(200, result);
		});
	});
	//curl -i -F filedata=@server.js http://localhost:8080/static/upload
	server.post("/statics/upload", helper.apiAuth, function (req, res, next) {
		if(!req.files) return res.send(400);

		var fileName = req.files.filedata.name,
			oldPath = req.files.filedata.path,
			newPath = path.join(config.filesPath, fileName);

		if(file.fileInfo(oldPath).size > maxSize) {
			file.delFile(oldPath, function(error, data){
				return res.send(400);				
			});
		} else {
			file.moveFile(oldPath, newPath, function(error, data){
				return res.send(201);				
			});
		}
	});
	//curl -X POST --data-binary @server.js http://localhost:8080/static/upload/server.js -H "Content-Type:application/octet-stream"
	server.post("/statics/upload/:name", helper.apiAuth, function (req, res, next) {
		if(!req.params.name) return res.send(400);
		var fileName = req.params.name,
			fileData = req.body,
			filePath = path.join(config.filesPath, fileName);
		
		if(fileData > maxSize) return res.send(400);
		
		file.writeFile(filePath, fileData, function(error, data){
			if(error) return res.send(400);
			res.send(201);
		});
	});
	//curl --upload server.js localhost:8080/static/upload/server.js
	//curl -X PUT --data-binary @server.js http://localhost:8080/static/upload/server.js -H "Content-Type:application/octet-stream"
	server.put("/statics/upload/:name", helper.apiAuth, function (req, res, next) {
		var fileName = req.params.name,
			fileData = req.body;

		if(!fileName) return res.send(400);

		var filePath = path.join(config.filesPath, fileName);
		if(fileData > maxSize){
			return res.send(400);
		}
		file.writeFile(filePath, fileData, function(error, data){
			if(error) return res.send(400);
			res.send(201);
		});
	});
	//curl -O http://localhost:8080/static/download/demo.js
	server.get("/statics/download/:name", helper.apiAuth, function (req, res, next) {
		var fileName = req.params.name
			filePath = path.join(config.filesPath, fileName);
			
		file.readFile(filePath, function(error, data){
			if(error) return res.send(404);
			if(fileName.indexOf('.plist') !== -1){
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
	//curl -X DELETE -i http://localhost:8080/static/myfile.js
	server.del("/statics/:name", helper.apiAuth, function(req, res, next){
		var fileName = req.params.name,
			filePath = path.join(config.filesPath, fileName);
		
		file.delFile(filePath, function(error, data){
			if(error) return res.send(404);
			res.send(202);
			return next();
		});
	});

	server.get("/statics/:name", helper.apiAuth, function(req, res, next){
		var fileName = req.params.name;
		var filePath = path.join(config.filesPath, fileName);

		fs.readFile(filePath, function(error, data){
			if(filePath.indexOf('.css') !== -1)
				res.setHeader('Content-Type', 'text/css');
			else if(filePath.indexOf('.html') !== -1)
				res.setHeader('Content-Type', 'text/html');
			else if(filePath.indexOf('.htm') !== -1)
				res.setHeader('Content-Type', 'text/html');
			else if(filePath.indexOf('.json') !== -1)
				res.setHeader('Content-Type', 'application/json');
			else if(filePath.indexOf('.js') !== -1)
				res.setHeader('Content-Type', 'text/javascript');
			else if(filePath.indexOf('.jpg') !== -1)
				res.setHeader('Content-Type', 'image/jpeg');
			else if(filePath.indexOf('.png') !== -1)
				res.setHeader('Content-Type', 'image/png');
			else
				res.setHeader('Content-Type', 'application/octet-stream');
			if(error) return next(error);
			res.write(data);
			res.end();
		});
	});
}