var http = require("http");

module.exports.init = function(server, helper){
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

		return stats;
	};

	server.get("/statistics/usage", function(req, res, next){
		server.server.getConnections(function(err, count){
			var result = {
				timestamp: new Date(),
				connections: count,
				transfer: _calculateStats()
			}
			res.send(result);
		});
	});

	server.get("/statistics/log", function(req, res, next){
		server.server.getConnections(function(err, count){
			var result = {
				timestamp: new Date(),
				connections: count,
				transfer: _calculateStats(),
				log: all
			}
			res.send(result);
		});
	});
}