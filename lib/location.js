var fs = require("fs"),
	path = require("path"),
	latlon = require("./latlon.js");

module.exports.init = function(server, location, helper){
	server.get("/location/settings", helper.apiAuth, function(req, res, next){
		res.send(200, {});
	});

	server.get("/location/:lat/:lon", helper.apiAuth, function(req, res, next){
		var lon = req.params.lon,
			lat = req.params.lat;

		location.nearBy(lat, lon, 0.1, function(err, data){
			if(err || !data) return next(err);
			res.send(200, data);
		});
	});

	var places = [];
	server.get("/location/load", helper.apiAuth, function(req, res, next){
		var pathToCSV = path.join(__dirname, "/../files/location/places.csv");
		
		console.log(places.length);
		
		if(places.length === 0){		
			var stream = fs.createReadStream(pathToCSV)
			 
			stream.on('readable', function(data){
				var buf;
				while (buf = stream.read()) {
					buf.toString().split('\n')
					.map(function(line){
						// console.log(line);
						places.push(line);
					});
				}
			});		 
			stream.on('end', function(){
				return res.send(200, "done");
			});
		} else {
			for (var i = 0; i < places.length; i++) {
				// console.log(places[i]);
			};
			return res.send(200, "done");			
		}
	});
}