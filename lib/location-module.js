var latlon = require("./latlon.js");

module.exports.init = function(storage){

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
		nearBy: _nearBy
	}
}