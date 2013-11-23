var http = require("http");

module.exports.init = function(server, storage, helper){
	var all = [];

	server.pre(function customHandler(req, res, next) {
		all.push({
			timestamp: new Date(),
			requestBytes: req.connection.bytesRead,
			responseBytes: req.connection.bytesWritten,
			url: req.url,
			method: req.method,
			statusCode: res.statusCode
		});
		next();
	});

	var _calculateStats = function(){
		var stats = all.reduce(function(state, event){
			state.totalBytes += event.requestBytes + event.responseBytes;
			state.count += 1
			return state;
		},{ 
			count: 0,
			totalBytes: 0
		});
		stats.totalKBytes = Math.floor(stats.totalBytes / 1024);
		stats.totalMBytes = Math.floor(stats.totalKBytes / 1024);
		stats.totalGBytes = Math.floor(stats.totalMBytes / 1024);
		return stats;
	};

	server.get("/statistics/usage", helper.apiAuth, function(req, res, next){
		server.server.getConnections(function(err, count){
			if(err) return next(err);

			storage.statistics(function(err, dbSize){
				if(err) return next(err);

				var result = {
					timestamp: new Date(),
					connections: count,
					dbSizeBytes: dbSize,
					dbSizeKBytes: Math.floor(dbSize / 1024),
					dbSizeMBytes: Math.floor((dbSize / 1024) / 1024),
					dbSizeGBytes: Math.floor(((dbSize / 1024) / 1024) / 1024),
					transfer: _calculateStats()
				}
				res.send(result);
			});
		});
	});
	server.get("/statistics/log", helper.apiAuth, function(req, res, next){
		server.server.getConnections(function(err, count){
			if(err) return next(err);
			var result = {
				timestamp: new Date(),
				connections: count,
				transfer: _calculateStats(),
				log: all
			}
			res.send(result);
		});
	});
	server.get("/statistics/db", helper.apiAuth, function(req, res, next){
		storage.statistics(function(err, dbSize){
			if(err) return next(err);
			var result = {
				timestamp: new Date(),
				dbSizeBytes: dbSize,
				dbSizeKBytes: Math.floor(dbSize / 1024),
				dbSizeMBytes: Math.floor((dbSize / 1024) / 1024),
				dbSizeGBytes: Math.floor(((dbSize / 1024) / 1024) / 1024),
			};

			res.send(200, result);
		});
	});
}