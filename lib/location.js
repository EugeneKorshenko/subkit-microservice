var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, location, helper){

	server.get("/location/settings", helper.apiAuth, function(req, res, next){
		res.send(200, {});
	});
	server.get("/location/sphereNearBy/:lat/:lon/:maxDistance", helper.apiAuth, function(req, res, next){
		var lon = req.params.lon,
			lat = req.params.lat,
			maxDistance = req.params.maxDistance || 0.1;
		
		location.sphereNearBy(lat, lon, maxDistance, function(error, data){
			if(error) return next(error);
			res.send(200, data);
		});
	});
	server.get("/location", helper.apiAuth, function(req, res, next){
		location.list(function(error, data){
			if(error) return next(error);
			res.send(200, data);
		});
	});
	server.get("/location/:id", helper.apiAuth, function(req, res, next){
		var id = req.params.id;
		
		location.get(id, function(error, data){
			if(error) return next(error);
			res.send(200, data);
		});
	});
	server.post("/location/:id", helper.apiAuth, function(req, res, next){
		var id = req.params.id,
			geoPoint = req.body || new location.GeoPoint(0,1);

		location.set(id, geoPoint, function(error, data){
			if(error) return next(error);
			res.send(201, { status: "ok" });
		});
	});
	server.put("/location/:id", helper.apiAuth, function(req, res, next){
		var id = req.params.id,
			geoPoint = req.body || new location.GeoPoint(0,1);
			
		location.set(id, geoPoint, function(error, data){
			if(error) return next(error);
			res.send(202, { status: "ok" });
		});
	});
	server.del("/location/:id", helper.apiAuth, function(req, res, next){
		var id = req.params.id;
			
		location.remove(id, function(error, data){
			if(error) return next(error);
			res.send(202, { status: "ok" });
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