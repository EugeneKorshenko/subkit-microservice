'use strict';

var http = require('http'),
	path = require('path'),
	uuid = require('node-uuid'),
	microtime = require('microtime'),
	moment = require('moment'),
	os = require('os');

module.exports.init = function(server, store, event, es, doc){
	require('./doc/statistics.doc.js').init(doc);

	server.pre(function (req, res, next) {
		var latency = res.get('Response-Time');
		if (typeof (latency) !== 'number') latency = Date.now() - req._time;
		var id = microtime.now();
		var log = {
			id: id,
			timestamp: new Date(),
			url: req.url.replace(/[?_=]*[0-9]/g,''),
			requestBytes: req.socket.bytesRead - (req.socket.oldBytesRead || 0),
			responseBytes: req.socket.bytesWritten - (req.socket.oldbytesWritten || 0),
			remoteAddress: req.connection.remoteAddress,
			userAgent:req.headers['user-agent'],
			method: req.method,
			latency: latency,
			secure: req.secure,
			statusCode: res.statusCode
		};
		req.socket.oldBytesRead = req.socket.bytesRead;
		req.socket.oldbytesWritten = req.socket.bytesWritten;
		server.server.getConnections(function(err, count){
			log.connections = count;
			store.update('statistics', 'raw!' + log.id, log, function(error){
				return next();
			});
		});
	});
	
	setInterval(function(){
		_runRawUsageAnalytics(function(err, data){
			store.insert('statistics', 'minute!'+microtime.now(), data);
		});
	}, 60000);
	setInterval(function(){
		var data = {
			loadAvg: os.loadavg(),
			freeMem: os.freemem(),
			memUsage: process.memoryUsage(),
			uptime: process.uptime()
		};
		store.update('statistics', 'os!'+microtime.now(), data);
	}, 60000);
	setInterval(function(){
		//cleanup minutes statistics
		var timeWindowInMinutes = 120;
		store.query('statistics!minute', {}, {}, function(err, data){
			if(!data && !data.results && data.results.length === 0) return;
			
			data.results.forEach(function(itm){
				var time = moment(new Date()).subtract('minutes', timeWindowInMinutes);
				var isOld = moment(itm.value.timestamp).isBefore(time);
				if(isOld) {
					store.del('statistics', itm.key, function(err, data){});
				}
			});
		});
	}, 3600000);

	var _runRawUsageAnalytics = function(callback){
		if(!callback) callback = function(){};

		es
		.from(['statistics'])
		.run({
			$init: function(state){
				state.http = {};
				state.urls = {};
				state.agents = {};
				state.connections = 0;
				state.currentConnections = 0;
				state.totalConnections = 0;
				state.totalBytes = 0;
				state.totalKBytes = 0;
				state.totalMBytes = 0;
				state.totalGBytes = 0;
				state.requestBytes = 0;
				state.responseBytes = 0;
				state.requestCount = 0;
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
				state.requestCount += 1;
				state.requestBytes += message.requestBytes;
				state.responseBytes += message.responseBytes;
				state.totalBytes = state.requestBytes + state.responseBytes;
				state.totalConnections += message.connections;

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
			server.server.getConnections(function(err, count){
				data.currentConnections = count;
				data.connections = Math.floor(data.totalConnections / data.requestCount);

				store.statistics(function(err, dbSize){
					if(err) return callback(err);

					data.dbSizeBytes = dbSize;
					data.dbSizeKBytes = Math.floor(dbSize / 1024);
					data.dbSizeMBytes = Math.floor((dbSize / 1024) / 1024);
					data.dbSizeGBytes = Math.floor(((dbSize / 1024) / 1024) / 1024);
					callback(null, data);
				});

			});
		});
	};

	//API
	server.get('/statistics/raw', function(req, res, next){
		es
		.from(['statistics'])
		.history(function(err, data){
			res.send(200, data);
		});
	});
	server.get('/statistics/minutes', function(req, res, next){
		es
		.from(['statistics'])
		.history(function(err, data){
			res.send(200, data);
		});
	});
	server.get('/statistics/summary', function(req, res, next){
		_runRawUsageAnalytics(function(err, data){
			if(err) return res.send(400, new Error('Usage analytics error.'));
			res.send(200, data);
		});
	});
};