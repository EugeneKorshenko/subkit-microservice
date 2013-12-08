var latlon = require("./latlon.js"),
	path = require("path"),
	geoip = require("geoip");

var pathToDB = path.join(__dirname + "/../files/location/GeoIPLiteCity.dat");

module.exports.init = function(storage){
	var City = geoip.City;
	var city = new City(pathToDB);

	var _byIP = function(ip, callback){
		var city_obj = city.lookupSync('8.8.8.8');
		if(callback) callback(null, city_obj);
		return city_obj;
	};

	var _nearBy = function(lat, lon, maxDistance, callback){
		var p1 = new latlon(lat, lon);
		storage.read("location", {}, function(err, data){
			if(err || !data) { 
				if(callback) return callback(err);
			}

			var result = data.map(function(point){
				var p2 =  new latlon(point.value.position.lat, point.value.position.lon);
				point.value["distance"] = p1.distanceTo(p2);
				return point;
			}).filter(function(point){
				return point.value.distance < maxDistance;
			});

			if(callback) callback(null, result);
		});
	}

	return {
		byIP: _byIP,
		nearBy: _nearBy
	}
}