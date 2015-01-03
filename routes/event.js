'use strict';

module.exports.init = function(server, event, doc){
	require('./doc/event.doc.js').init(doc);

	// heartbeat
	(function(){
		var count = 0;
		setInterval(function(){
			count++;
			event.emit('heartbeat', {value: count});		
		}, 1000);
	})();

	//events
	server.get('/events/bind/:stream/:clientId', function (req, res, next) {
		var stream = req.params.stream,
			clientId = req.params.clientId;

		event.bind(stream, clientId, function(err, data){
			if(err) res.send(404, err);
			res.contentType = 'application/json';
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify([data]));
		});
	});
	server.del('/events/bind/:stream/:clientId', function(req,res,next){
		var stream = req.params.stream,
			clientId = req.params.clientId;

		if(!stream || !clientId) res.send(404);
		
		event.unsubscribe(stream, clientId);
		res.send(202);
	});

	server.post('/events/emit/:stream', function (req, res, next) {
		var stream = req.params.stream;
		var	message = req.body;

		var isPersistent = req.headers['x-sk-event-persistent'] || false;

		if(message) event.emit(stream, message, {}, isPersistent);
		res.send(201, {message: 'emitted'});
	});

	server.get('/events/log/:stream', function(req, res, next){
		var stream = req.params.stream;
		event.log(stream, {}, {}, function(err, data){
			if(err) return res.send(500,err);
			res.send(data);
			return next();
		});
	});
	server.del('/events/log/:stream', function(req, res, next){
		var stream = req.params.stream;
		event.deleteLog(stream, function(err, data){
			if(err) return res.send(500,err);
			res.send(202, {message: "delete accepted"});
			return next();
		});
	});

	server.get('/events/streams', function(req,res,next){
		event.getChannels(function(err, data){
			res.send(200, data);
		});
	});
	server.get('/events/streams/:clientId', function(req,res,next){
		var clientId = req.params.clientId;
		if(!clientId) res.send(404);
		
		event.getChannelsByClientId(clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.get('/events/clients', function(req,res,next){
		event.getClients(function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.get('/events/clients/:stream', function(req,res,next){
		var stream = req.params.stream;
		if(!stream) res.send(400);

		event.getClientsByChannel(stream, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});


};