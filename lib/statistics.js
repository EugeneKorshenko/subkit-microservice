var http = require("http");

module.exports.init = function(server, storage, staticConfig, helper){
	var staticFiles = require('./file-module.js').init(staticConfig);
	var all = [];

	server.pre(function customHandler(req, res, next) {
		var latency = res.get('Response-Time');
		if (typeof (latency) !== 'number') latency = Date.now() - req._time;
		
		all.push({
			timestamp: new Date(),
			url: req.url,
			requestBytes: req.connection.bytesRead - (req.connection.oldBytesRead || 0),
			responseBytes: req.connection.bytesWritten - (req.connection.oldbytesWritten || 0),
			remoteAddress: req.connection.remoteAddress,
			userAgent:req.headers["user-agent"],
			method: req.method,
			latency: latency,
			secure: req.secure,
			statusCode: res.statusCode
		});
		req.connection.oldBytesRead = req.connection.bytesRead;
		req.connection.oldbytesWritten = req.connection.bytesWritten;
		return next();
	});

	var _calculateStats = function(){
		var stats = all.reduce(function(state, event){
			state.requestBytes += event.requestBytes;
			state.responseBytes += event.responseBytes;
			state.totalBytes = state.requestBytes + state.responseBytes
			state.count += 1
			return state;
		}, { 
			count: 0,
			totalBytes: 0,
			requestBytes: 0,
			responseBytes: 0
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

				staticFiles.dirStatistics(staticConfig.filesPath, function(err, staticsDirSize){
					if(err) return next(err);

					var result = {
						timestamp: new Date(),
						connections: count,
						dbSizeBytes: dbSize,
						dbSizeKBytes: Math.floor(dbSize / 1024),
						dbSizeMBytes: Math.floor((dbSize / 1024) / 1024),
						dbSizeGBytes: Math.floor(((dbSize / 1024) / 1024) / 1024),
						staticsDirSizeKBytes: staticsDirSize,
						staticsDirSizeMBytes: Math.floor(staticsDirSize / 1024),
						staticsDirSizeGBytes: Math.floor((staticsDirSize / 1024) / 1024),
						transfer: _calculateStats()
					}
					res.send(result);
				});
			});
		});
	});
	server.get("/statistics/log", function(req, res, next){
		server.server.getConnections(function(err, count){
			if(err) return next(err);
			res.send(all);
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