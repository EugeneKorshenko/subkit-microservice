var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, es, helper){
	server.get("/eventsource/all", function(req, res, next){
		es.get(function(err, data){
			res.send(data);
		});
	});
}