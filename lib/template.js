var path = require("path");

module.exports.init = function(server, filesConfig, helper){
	var maxSize = 1000000000;
	var file = require('./file-module.js').init(filesConfig);
	//templates
	//curl localhost:8080/templates
	server.get("/templates", helper.apiAuth, function(req,res,next){
		file.readDir(filesConfig.filesPath, function(error, data){
			var result = [];
			data.forEach(function(itm){
				if(itm[0]!=="." && itm!=="README.txt") result.push(itm);
			});
			res.send(200, result);
		});
	});
	//curl -i -F filedata=@server.js http://localhost:8080/template/upload
	server.post("/template/upload", helper.apiAuth, function (req, res, next) {
		if(!req.files) return res.send(400);

		var fileName = req.files.filedata.name,
			oldPath = req.files.filedata.path,
			newPath = path.join(filesConfig.filesPath, fileName);

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
	//curl -X POST --data-binary @server.js http://localhost:8080/template/upload/server.js -H "Content-Type:application/octet-stream"
	server.post("/template/upload/:name", helper.apiAuth, function (req, res, next) {
		if(!req.params.name) return res.send(400);
		var fileName = req.params.name,
			fileData = req.body,
			filePath = path.join(filesConfig.filesPath, fileName);
		
		if(fileData > maxSize) return res.send(400);
		
		file.writeFile(filePath, fileData, function(error, data){
			if(error) return res.send(400);
			res.send(201);
		});
	});
	//curl --upload server.js localhost:8080/template/upload/server.js
	//curl -X PUT --data-binary @server.js http://localhost:8080/template/upload/server.js -H "Content-Type:application/octet-stream"
	server.put("/template/upload/:name", helper.apiAuth, function (req, res, next) {
		var fileName = req.params.name,
			fileData = req.body;

		if(!fileName) return res.send(400);

		var filePath = path.join(filesConfig.filesPath, fileName);
		if(fileData > maxSize){
			return res.send(400);
		}
		file.writeFile(filePath, fileData, function(error, data){
			if(error) return res.send(400);
			res.send(201);
		});
	});
	//curl -O http://localhost:8080/template/download/demo.js
	server.get("/template/download/:name", helper.apiAuth, function (req, res, next) {
		var fileName = req.params.name
			filePath = path.join(filesConfig.filesPath, fileName);
			
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
	//curl -X DELETE -i http://localhost:8080/template/myfile.js
	server.del("/template/:name", helper.apiAuth, function(req, res, next){
		var fileName = req.params.name,
			filePath = path.join(filesConfig.filesPath, fileName);
		
		file.delFile(filePath, function(error, data){
			if(error) return res.send(404);
			res.send(202);
			return next();
		});
	});
}