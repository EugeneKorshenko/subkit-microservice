var fs = require("fs"),
	path = require("path"),
	latlon = require("./latlon.js");

module.exports.init = function(server, location, helper){
	server.get("/location/settings", function(req, res, next){
		res.send(200, {});
	});

	server.get("/location/:lat/:lon", function(req, res, next){
		var lon = req.params.lon,
			lat = req.params.lat;

		location.nearBy(lat, lon, 0.1, function(err, data){
			if(err || !data) return next(err);
			res.send(200, data);
		});
	});
}