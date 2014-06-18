'use strict';

var http = require('http'),
	path = require('path'),
	uuid = require('node-uuid'),
	microtime = require('microtime');

module.exports.init = function(server, storage, pubsub, es, helper, doc){

	var statistics_doc = doc('statistics', 'Instance usage statistics operations.');
	statistics_doc.models.Usage = {
		id: 'Usage',
		properties: {
			id: {
				type: 'integer'
			},
			timestamp: {
				type: 'date'
			},
			requestBytes: {
				type: 'integer'
			},
			responseBytes: {
				type: 'integer'
			},
			totalBytes: {
				type: 'integer'
			},
			totalKBytes: {
				type: 'integer'
			},
			totalMBytes: {
				type: 'integer'
			},
			totalGBytes: {
				type: 'integer'
			},
			connections: {
				type: 'integer'
			},
			dbSizeBytes: {
				type: 'integer'
			},
			dbSizeKBytes: {
				type: 'integer'
			},
			dbSizeMBytes: {
				type: 'integer'
			},
			dbSizeGBytes: {
				type: 'integer'
			},
			agents:{
				type: 'complex'
			},
			http:{
				type: 'complex'
			},
			urls:{
				type: 'complex'
			}		
		}
	};
	statistics_doc.get('/statistics/summary', 'Get service instance usage analytics.', {
	    nickname: 'getUsageAnalytics',
		responseClass: 'Usage',
		notes:'',
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: 'Error.'
			}
		]
	});
	statistics_doc.get('/statistics/raw', 'Get service instance raw usage analytics.', {
	    nickname: 'getRawUsageAnalytics',
		responseClass: 'Usage',
		notes:'',
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: 'Error.'
			}
		]
	});
	statistics_doc.get('/statistics/minutes', 'Get service instance minute usage analytics.', {
	    nickname: 'getMinuteUsageAnalytics',
		responseClass: 'Usage',
		notes:'',
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: 'Error.'
			}
		]
	});
	
	server.pre(function (req, res, next) {
		var latency = res.get('Response-Time');
		if (typeof (latency) !== 'number') latency = Date.now() - req._time;
		var id = microtime.now();
		var log = {
			id: id,
			timestamp: new Date(),
			url: req.url.replace(/[?_=]*[0-9]/g,''),
			requestBytes: req.connection.socket.bytesRead - (req.connection.socket.oldBytesRead || 0),
			responseBytes: req.connection.socket.bytesWritten - (req.connection.socket.oldbytesWritten || 0),
			remoteAddress: req.connection.remoteAddress,
			userAgent:req.headers['user-agent'],
			method: req.method,
			latency: latency,
			secure: req.secure,
			statusCode: res.statusCode
		};
		req.connection.socket.oldBytesRead = req.connection.socket.bytesRead;
		req.connection.socket.oldbytesWritten = req.connection.socket.bytesWritten;
		storage.upsert('statistics', 'raw!' + log.id, log, function(error){
			return next();
		});
	});
	setInterval(function(){
		_runRawUsageAnalytics(function(err, data){
			storage.upsert('statistics', 'minute!'+microtime.now(), data, function(error){
				//TODO: logger
			});
		});
	}, 60000);
	var _runRawUsageAnalytics = function(callback){
		if(!callback) callback = function(){};

		es
		.fromStreams(['raw'], 'statistics')
		.run({
			$init: function(state){
				state.http = {};
				state.urls = {};
				state.agents = {};
				state.connections = 0;
				state.totalBytes = 0;
				state.totalKBytes = 0;
				state.totalMBytes = 0;
				state.totalGBytes = 0;
				state.requestBytes = 0;
				state.responseBytes = 0;
				return state;
			},
			$completed: function(state){
				state.id = microtime.now();
				state.timestamp = new Date();
				state.totalKBytes = Math.floor(state.totalBytes / 1024);
				state.totalMBytes = Math.floor(state.totalKBytes / 1024);
				state.totalGBytes = Math.floor(state.totalMBytes / 1024);
				return state;
			},
			raw: function(state, message){
				state.requestBytes += message.requestBytes;
				state.responseBytes += message.responseBytes;
				state.totalBytes = state.requestBytes + state.responseBytes;
				state.connections += 1;

				if(!state.http[message.method]) state.http[message.method]=0;
				state.http[message.method] += 1;

				if(!state.urls[message.url]) state.urls[message.url]=0;
				state.urls[message.url] += 1;

				if(!state.agents[message.userAgent]) state.agents[message.userAgent]=0;
				state.agents[message.userAgent] += 1;

				return state;
			}
		}, function(err, data){
			if(err) return callback(err);

			storage.statistics(function(err, dbSize){
				if(err) return callback(err);

				data.dbSizeBytes = dbSize;
				data.dbSizeKBytes = Math.floor(dbSize / 1024);
				data.dbSizeMBytes = Math.floor((dbSize / 1024) / 1024);
				data.dbSizeGBytes = Math.floor(((dbSize / 1024) / 1024) / 1024);
				callback(null, data);
			});
		});
	};
	server.get('/statistics/raw', function(req, res, next){
		es
		.fromStreams(['raw'], 'statistics')
		.history(function(err, data){
			res.send(200, data);
		});
	});
	server.get('/statistics/minutes', function(req, res, next){
		es
		.fromStreams(['minute'], 'statistics')
		.history(function(err, data){
			res.send(200, data);
		});
	});
	server.get('/statistics/summary', function(req, res, next){
		_runRawUsageAnalytics(function(err, data){
			if(err) return res.send(400, new Error("Usage analytics error."))
			res.send(200, data);
		});
	});


	//obsolete
	var _calculateStats = function(callback){
		storage.read('statistics',{},function(err, data){
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
	//obsolete
	server.get('/statistics/usage', helper.apiAuth, function(req, res, next){
		server.server.getConnections(function(err, count){
			if(err) return next(err);

			storage.statistics(function(err, dbSize){
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
						transfer: transfer
					}
					res.send(result);
				});
			});
		});
	});
	//obsolete
	server.get('/statistics/log', helper.apiAuth, function(req, res, next){
		storage.read('statistics',{},function(err, data){
			if(err) return next(err);
			res.send(data);
		});
	});
	//obsolete
	server.get('/statistics/db', helper.apiAuth, function(req, res, next){
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
	//obsolete
	server.get('/statistics/analytics', helper.apiAuth, function(req, res, next){
		storage.read('statistics',{},function(err, data){
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