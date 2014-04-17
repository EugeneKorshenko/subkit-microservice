'use strict';

var http = require("http"),
	uuid = require("node-uuid");

module.exports.init = function(server, storage, staticConfig, pubsub, helper, doc){
	var staticFiles = require('./file-module.js').init(staticConfig);
	
	var statistics_doc = doc("statistics", "Service statistic operations.");
	statistics_doc.models.Transfer = {
		id: "Transfer",
		properties: {
			count: {
				type: "integer"
			},
			requestBytes: {
				type: "integer"
			},
			responseBytes: {
				type: "integer"
			},
			totalBytes: {
				type: "integer"
			},
			totalKBytes: {
				type: "integer"
			},
			totalMBytes: {
				type: "integer"
			},
			totalGBytes: {
				type: "integer"
			}			
		}
	};
	statistics_doc.models.Usage = {
		id: "Usage",
		properties: {
			timestamp: {
				type: "integer"
			},
			connections: {
				type: "integer"
			},
			dbSizeBytes: {
				type: "integer"
			},
			dbSizeKBytes: {
				type: "integer"
			},
			dbSizeMBytes: {
				type: "integer"
			},
			dbSizeGBytes: {
				type: "integer"
			},
			staticsDirSizeKBytes: {
				type: "integer"
			},
			staticsDirSizeMBytes: {
				type: "integer"
			},
			staticsDirSizeGBytes: {
				type: "integer"
			},
			transfer: {
				$ref: "Transfer"
			}
		}
	};
	statistics_doc.models.Analytic = {
		id: "Analytic",
		properties: {
			agents:{
				type: "complex"
			},
			http:{
				type: "complex"
			},
			urls:{
				type: "complex"
			}
		}
	}
	statistics_doc.get("/statistics/usage", "Get service instance usage summaries.", {
	    nickname: "getUsage",
		responseClass: "Usage",
		notes:"",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});
	statistics_doc.get("/statistics/analytics", "Get service instance request analytics.", {
	    nickname: "getAnalytics",
		responseClass: "Analytic",
		notes:"",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});

	server.pre(function customHandler(req, res, next) {
		var latency = res.get('Response-Time');
		if (typeof (latency) !== 'number') latency = Date.now() - req._time;
		
		var log = {
			id: uuid.v1(),
			timestamp: Date.now(),
			url: req.url.replace(/[?_=]*[0-9]/g,''),
			requestBytes: req.connection.bytesRead - (req.connection.oldBytesRead || 0),
			responseBytes: req.connection.bytesWritten - (req.connection.oldbytesWritten || 0),
			remoteAddress: req.connection.remoteAddress,
			userAgent:req.headers["user-agent"],
			method: req.method,
			latency: latency,
			secure: req.secure,
			statusCode: res.statusCode
		};
		req.connection.oldBytesRead = req.connection.bytesRead;
		req.connection.oldbytesWritten = req.connection.bytesWritten;
		// var key = "http!" + log.timestamp + "!" + log.id;
		// pubsub.send("statistics", key, log);	
		storage.create("statistics", log.timestamp + "!" + log.id, log, function(error){
			return next();
		});
	});
	var _calculateStats = function(callback){
		storage.read("statistics",{},function(err, data){
			if(err) callback(err);
			
			var stats = data.reduce(function(state, event){
				state.requestBytes += event.value.requestBytes;
				state.responseBytes += event.value.responseBytes;
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
			callback(null, stats);
		});
	};

	server.get("/statistics/usage", helper.apiAuth, function(req, res, next){
		server.server.getConnections(function(err, count){
			if(err) return next(err);

			storage.statistics(function(err, dbSize){
				if(err) return next(err);

				staticFiles.dirStatistics(staticConfig.filesPath, function(err, staticsDirSize){
					if(err) return next(err);

					_calculateStats(function(err, transfer){
						if(err) return next(err);

						var result = {
							timestamp: Date.now(),
							connections: count,
							dbSizeBytes: dbSize,
							dbSizeKBytes: Math.floor(dbSize / 1024),
							dbSizeMBytes: Math.floor((dbSize / 1024) / 1024),
							dbSizeGBytes: Math.floor(((dbSize / 1024) / 1024) / 1024),
							staticsDirSizeKBytes: staticsDirSize,
							staticsDirSizeMBytes: Math.floor(staticsDirSize / 1024),
							staticsDirSizeGBytes: Math.floor((staticsDirSize / 1024) / 1024),
							transfer: transfer
						}
						res.send(result);
					});
				});
			});
		});
	});
	server.get("/statistics/log", function(req, res, next){
		storage.read("statistics",{},function(err, data){
			if(err) return next(err);
			res.send(data);
		});
	});
	server.get("/statistics/db", helper.apiAuth, function(req, res, next){
		storage.statistics(function(err, dbSize){
			if(err) return next(err);
			var result = {
				timestamp: Date.now(),
				dbSizeBytes: dbSize,
				dbSizeKBytes: Math.floor(dbSize / 1024),
				dbSizeMBytes: Math.floor((dbSize / 1024) / 1024),
				dbSizeGBytes: Math.floor(((dbSize / 1024) / 1024) / 1024),
			};

			res.send(200, result);
		});
	});
	server.get("/statistics/analytics", helper.apiAuth, function(req, res, next){
		storage.read("statistics",{},function(err, data){
			if(err) return next(err);
			
			var stats = data.reduce(function(state, event){
				if(!state.http[event.value.method]) state.http[event.value.method]=0;
				state.http[event.value.method] += 1;

				if(!state.urls[event.value.url]) state.urls[event.value.url]=0;
				state.urls[event.value.url] += 1;

				if(!state.agents[event.value.userAgent]) state.agents[event.value.userAgent]=0;
				state.agents[event.value.userAgent] += 1;

				return state;
			}, { 
				http: {},
				urls: {},
				agents: {}
			});
			res.send(stats);
		});
	});
};