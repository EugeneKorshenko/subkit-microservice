var latlon = require("./latlon.js"),
	path = require("path"),
	randString = require("randomstring"),
	_ = require("underscore");
	// geoip = require("geoip");

// var pathToDB = path.join(__dirname + "/../files/location/GeoIPLiteCity.dat");

module.exports.init = function(storage){
	var GeoPoint = function(lat, lon){
		this.Latitude = lat;
		this.Longitude = lon;
		this.Payload = {};
	};

	var _sphereNearBy = function(lat, lon, maxDistance, callback){
		callback(null, [new GeoPoint(0,0), new GeoPoint(1,0), new GeoPoint(2,0)]);
	};

	var _find = function(deviceId, callback){
		storage.read("location!geopoint", {key: deviceId}, callback);
	};
	var _findAll = function(query, callback){
		storage.query("location!geopoint", {}, query, callback);
	};

	var _list = function(callback){
		callback(null, [new GeoPoint(0,0), new GeoPoint(1,0), new GeoPoint(2,0)]);
	};

	var _get = function(id, callback){
		callback(null, new GeoPoint(0,0));
	};

	var _set = function(id, geoPoint, callback){
		if(!id) id = randString.generate(12);
		console.log(id);
		callback(null, new GeoPoint(0,0));
	};

	var _remove = function(id, callback){
		callback(null, new GeoPoint(0,0));
	};

	// var City = geoip.City;
	// var city = new City(pathToDB);

	// var _byIP = function(ip, callback){
	// 	var city_obj = city.lookupSync('8.8.8.8');
	// 	if(callback) callback(null, city_obj);
	// 	return city_obj;
	// };

	// var _nearBy = function(lat, lon, maxDistance, callback){
	// 	var p1 = new latlon(lat, lon);
	// 	storage.read("location", {}, function(err, data){
	// 		if(err || !data) { 
	// 			if(callback) return callback(err);
	// 		}

	// 		var result = data.map(function(point){
	// 			var p2 =  new latlon(point.value.position.lat, point.value.position.lon);
	// 			point.value["distance"] = p1.distanceTo(p2);
	// 			return point;
	// 		}).filter(function(point){
	// 			return point.value.distance < maxDistance;
	// 		});

	// 		if(callback) callback(null, result);
	// 	});
	// }

	return {
		GeoPoint: GeoPoint,
		find: _find,
		findAll: _findAll,
		list: _list,
		set: _set,
		get: _get,
		remove: _remove,
		sphereNearBy: _sphereNearBy
	}
}