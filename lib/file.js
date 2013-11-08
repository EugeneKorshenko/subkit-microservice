var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, filesConfig, file, helper){
	var maxSize = 1000000000;
	//files
	//curl localhost:8080/files
	server.get("/files", helper.apiAuth, function(req,res,next){
		fs.readdir(filesConfig.filesPath, function(error, data){
			var result = [];
			data.forEach(function(itm){
				if(itm[0]!=="." && itm!=="README.txt") result.push(itm);
			});
			res.send(200, result);
		});
	});
	//curl -i -F filedata=@server.js http://localhost:8080/file/upload
	server.post("/file/upload", helper.apiAuth, function (req, res, next) {
		if(!req.files) return res.send(400);

		var fileName = req.files.filedata.name,
			oldPath = req.files.filedata.path,
			newPath = path.join(filesConfig.filesPath, fileName);

		if(fs.statSync(oldPath).size > maxSize) {
			fs.unlinkSync(oldPath);
			return res.send(400);
		}
		fs.renameSync(oldPath, newPath);
		return res.send(201);
	});
	//curl -X POST --data-binary @server.js http://localhost:8080/file/upload/server.js -H "Content-Type:application/octet-stream"
	server.post("/file/upload/:name", helper.apiAuth, function (req, res, next) {
		if(!req.params.name) return res.send(400);
		
		var fileName = req.params.name,
			file = req.body.toString(),
			filePath = path.join(filesConfig.filesPath, fileName);
		
		if(file > maxSize) return res.send(400);
		
		fs.writeFile(filePath, file, function(error, data){
			if(error) return res.send(400);
			res.send(200);
		});
	});
	//curl --upload server.js localhost:8080/file/upload/server.js
	//curl -X PUT --data-binary @server.js http://localhost:8080/file/upload/server.js -H "Content-Type:application/octet-stream"
	server.put("/file/upload/:name", helper.apiAuth, function (req, res, next) {
		var fileName = req.params.name,
			file = req.body.toString();
			console.log(fileName);
			console.log(file);
		if(!fileName) return res.send(400);

		var filePath = path.join(filesConfig.filesPath, fileName);
		if(file > maxSize){
			return res.send(400);
		}
		fs.writeFile(filePath, file, function(error, data){
			if(error) return res.send(400);
			res.send(200);
		});
	});
	//curl -O http://localhost:8080/file/download/demo.js
	server.get("/file/download/:name", helper.apiAuth, function (req, res, next) {
		var fileName = req.params.name
			filePath = path.join(filesConfig.filesPath, fileName);
		fs.readFile(filePath, function(error, data){
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
	//curl -X DELETE -i http://localhost:8080/file/myfile.js
	server.del("/file/:name", helper.apiAuth, function(req, res, next){
		var fileName = req.params.name,
			filePath = path.join(filesConfig.filesPath, fileName);
		fs.unlink(filePath, function(error, data){
			if(error) return res.send(404);
			res.send(202);
			return next();
		});
	});
}