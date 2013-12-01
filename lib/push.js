var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, storage, push, helper){
	server.get("/push/settings", function(req, res, next){
		res.send(200, {});
	});

//9e4c089d4f00e9878010007b12584203308a792b7884cecf22f431d0e5583618
	server.post("/push/send", function(req, res, next){
		var data = req.body;
		if(data) push.sendAPN(data.device, data.message);
		res.send(201, { status: "sent" });
	});
}