var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, config, storage, push, helper){
	var maxSize = 10000;
	server.get("/push/settings", function(req, res, next){
		res.send(200, {});
	});

	//9e4c089d4f00e9878010007b12584203308a792b7884cecf22f431d0e5583618
	server.post("/push/send", function(req, res, next){
		var data = req.body;
		if(data) push.sendAPN(data.device, data.message);
		res.send(201, { status: "sent" });
	});

		//curl -i -F filedata=@server.js http://localhost:8080/static/upload
	server.post("/push/upload", helper.apiAuth, function (req, res, next) {
		var fileData = req.body;
		if(fileData > maxSize) return res.send(400);
		
		fs.writeFile(config.pfx, fileData, function(error, data){
			if(error) return res.send(400);
			push.initAPN();
			res.send(201);
		});
	});
}