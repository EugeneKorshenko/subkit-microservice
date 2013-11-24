var path = require("path");

module.exports.init = function(server, config, helper){
	var maxSize = 1000000000;
	var file = require('./file-module.js').init(config);
	var renderer = require("./template-module.js").init({
		templatesPath: config.filesPath
	});

	//templates
	//curl localhost:8080/templates
	server.get("/templates", helper.apiAuth, function(req,res,next){
		file.readDir(config.filesPath, function(error, data){
			var result = [];
			data.forEach(function(itm){
				if(itm[0]!=="." && itm!=="README.txt") result.push(itm.replace(".jshtml",""));
			});
			res.send(200, result);
		});
	});

	//curl -X POST --data-binary @server.js http://localhost:8080/templates/upload/server.js -H "Content-Type:application/octet-stream"
	server.post("/templates/upload/:name", helper.apiAuth, function (req, res, next) {
		if(!req.params.name) return res.send(400);
		var fileName = req.params.name+".jshtml",
			fileData = req.body,
			filePath = path.join(config.filesPath, fileName);
		
		if(fileData > maxSize) return res.send(400);
		
		file.writeFile(filePath, fileData, function(error, data){
			if(error) return res.send(400);
			res.send(201);
		});
	});
	//curl --upload server.js localhost:8080/templates/upload/server.js
	//curl -X PUT --data-binary @server.js http://localhost:8080/templates/upload/server.js -H "Content-Type:application/octet-stream"
	server.put("/templates/upload/:name", helper.apiAuth, function (req, res, next) {
		var fileName = req.params.name+".jshtml",
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
	//curl -O http://localhost:8080/templates/download/demo.js
	server.get("/templates/download/:name", helper.apiAuth, function (req, res, next) {
		var fileName = req.params.name+".jshtml"
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
	//curl -X DELETE -i http://localhost:8080/templates/myfile.js
	server.del("/templates/:name", helper.apiAuth, function(req, res, next){
		var fileName = req.params.name+".jshtml",
			filePath = path.join(config.filesPath, fileName);
		
		file.delFile(filePath, function(error, data){
			if(error) return res.send(404);
			res.send(202);
			return next();
		});
	});

	server.get("/templates/:name", helper.apiAuth, function(req, res, next){
		var templateName = req.params.name;
		renderer.render(templateName, config.templateData, function(err, html){
			if(err) return next(new Error(err.message));
			res.contentType = 'text/html';
			res.write(html);
			res.end();
		});
	});
}