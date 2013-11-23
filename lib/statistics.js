var http = require("http");

module.exports.init = function(server, storage, staticConfig, helper){
	var staticFiles = require('./file-module.js').init(staticConfig);
	var all = [];
	var transfer = {
		requestBytes: 0,
		responseBytes: 0
	};
	server.on('connection', function(socket){
	    socket.on('close',function(){
	    	transfer.requestBytes += socket.bytesRead;
	    	transfer.responseBytes += socket.bytesWritten;
	    }); 
	});
	server.pre(function customHandler(req, res, next) {
		all.push({
			timestamp: new Date(),
			url: req.url,
			method: req.method,
			statusCode: res.statusCode
		});
		next();
	});

	var _calculateStats = function(){
		var stats = all.reduce(function(state, event){
			state.count += 1
			return state;
		}, { 
			count: 0
		});
		var totalBytes = transfer.requestBytes + transfer.responseBytes;
		stats.totalRequestBytes = transfer.requestBytes;
		stats.totalResponseBytes = transfer.responseBytes;
		stats.totalBytes = totalBytes;
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