var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, helper){
	server.get("/push/settings", function(req, res, next){
		res.send(200, {});
	});
}