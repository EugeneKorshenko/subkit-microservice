'use strict';

var path = require("path");

module.exports.init = function(server, config, renderer, helper, doc){
	var maxSize = 1000000000;
	var file = require('./file-module.js').init(config);

	var template_doc = doc("templates", "Template engine operations.");
	template_doc.models.Value = {
	};
	template_doc.get("/templates", "Get all templates.", {
	    nickname: "list",
		responseClass: "List[string]",
		notes:"curl https://:hostname/templates",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	template_doc.get("/templates/{name}", "Get a rendered template.", {
	    nickname: "renderTemplate",
	    responseClass: "string",
	    notes:'curl https://:hostname/templates/:name',
	    produces:["text/html"],
		parameters: [
			{name: "name", description: "Template name.", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[{
				code: 500,
				message: "Template module error."
			}
		]
	});
	template_doc.get("/templates/download/{name}", "Download a template.", {
	    nickname: "downloadTemplate",
	    responseClass: "string",
	    notes: 'curl -O https://:hostname/templates/download/:name',
	    produces:["text/html"],
		parameters: [
			{name: "name", description: "Download a template by name.", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[{
				code: 500,
				message: "Template module error."
			}
		]
	});
	template_doc.post("/templates/upload/{name}", "Add a template.", {
	    nickname: "addTemplate",
		responseClass: "void",
		notes: 'curl -X POST --data-binary @:filename https://:hostname/templates/upload/:name -H "Content-Type:application/octet-stream"',
		parameters: [
			{name: "name", description: "Template name.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 400,
				message: "Add template failed."
			},
			{
				code: 500,
				message: "Template error."
			}
		]
	});
	template_doc.put("/templates/upload/{name}", "Change a template.", {
	    nickname: "changeTemplate",
		responseClass: "void",
		notes: 'curl --upload :filename :hostname/templates/upload/:name <br> curl -X PUT --data-binary @:filename https://:hostname/templates/upload/:name -H "Content-Type:application/octet-stream"',
		parameters: [
			{name: "name", description: "Template name.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 400,
				message: "Change template failed."
			},
			{
				code: 500,
				message: "Template error."
			}
		]
	});
	template_doc.delete("/templates/{name}", "Remove a template.", {
	    nickname: "deleteTemplate",
		responseClass: "void",
		notes: 'curl -X DELETE -i https://:hostname/templates/:name',
		parameters: [
			{name: "name", description: "Template name.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Template error."
			}
		]
	});

	//curl localhost:8080/templates
	server.get("/templates", helper.apiAuth, function(req,res,next){
		file.readDir(config.filesPath, function(error, data){
			var result = [];
			data.forEach(function(itm){
				if(itm[0]!=="." && itm!=="README.txt") 
					result.push(itm.replace(".jshtml",""));
			});
			res.send(200, result);
		});
	});
	//curl localhost:8080/templates/<name>
	server.get("/templates/:name", helper.apiAuth, function(req, res, next){
		var templateName = req.params.name;
		renderer.render(templateName, config.templateData, function(err, html){
			if(err) return next(new Error(err.message));
			res.setHeader('Content-Type', 'text/html');
			res.write(html);
			res.end();
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
			fileData = req.body,
			filePath = path.join(config.filesPath, fileName);

		if(!fileName) return res.send(400);
		if(fileData > maxSize) return res.send(400);

		file.writeFile(filePath, fileData, function(error, data){
			if(error) return res.send(400);
			res.send(201);
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
};