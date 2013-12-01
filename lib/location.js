var fs = require("fs"),
	path = require("path"),
	latlon = require("./latlon.js");

module.exports.init = function(server, storage, helper){
	server.get("/location/settings", function(req, res, next){
		res.send(200, {});
	});

	server.get("/location/:lat/:lon", function(req, res, next){
		var lon = req.params.lon,
			lat = req.params.lat;
		var p1 = new latlon(lat, lon);

		storage.read("location", {}, function(err, data){
			if(err || !data) return next(new Error("not found"));
			var result = data.map(function(question){
				var p2 =  new latlon(question.value.questionPosition.lat, question.value.questionPosition.lon);
				question.value["distance"] = p1.distanceTo(p2);
				return question;
			}).filter(function(question){
				return question.value.distance < defaultDistance;
			});
			res.send(200, result);
		});
	});
}