var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, storage, helper){
	server.get("/push/settings", function(req, res, next){
		res.send(200, {});
	});
}