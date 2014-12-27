'use strict';

module.exports.init = function(server, event, doc){
	require('./event.doc.js').init(doc);

	//heartbeat
	(function(){
		var count = 0;
		setInterval(function(){
			count++;
			event.publish('heartbeat', count, {value: count});		
		}, 1000);
	})();

	//events
	server.get('/events/subscribe/:channel/:clientId', function (req, res, next) {
		var channel = req.params.channel,
			clientId = req.params.clientId;

		event.subscribe(channel, clientId, function(err, data){
			if(err) res.send(404, err);
			res.contentType = 'application/json';
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify([data]));
		});
	});
	server.del('/events/subscribe/:channel/:clientId', function(req,res,next){
		var channel = req.params.channel,
			clientId = req.params.clientId;

		if(!channel || !clientId) res.send(404);
		
		event.unsubscribe(channel, clientId);
		res.send(202);
	});

	server.get('/events/channels', function(req,res,next){
		event.getChannels(function(err, data){
			res.send(200, data);
		});
	});
	server.get('/events/channels/:clientId', function(req,res,next){
		var clientId = req.params.clientId;
		if(!clientId) res.send(404);
		
		event.getChannelsByClientId(clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.post('/events/channel/publish/:channel', function (req, res, next) {
		var channel = req.params.channel,
			message = req.body;

		if(message) event.publish(channel, message);
		res.send(201, {message: 'published'});
	});

	server.get('/events/clients', function(req,res,next){
		event.getClients(function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.get('/events/clients/:channel', function(req,res,next){
		var channel = req.params.channel;
		if(!channel) res.send(400);

		event.getClientsByChannel(channel, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});

	server.post('/events/client/publish/:clientId', function (req, res, next) {
		var clientId = req.params.clientId,
			message = req.body;
		
		if(message) event.send(clientId, message);
		res.send(201, {message: 'sent'});
	});
	server.get('/events/client/:channel/:clientId', function (req, res, next) {
		var clientId = req.params.clientId,
			channel = req.params.channel;

		event.receive(channel, clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.get('/events/client/:clientId', function (req, res, next) {
		var clientId = req.params.clientId;

		event.receiveAll(clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});

	server.get('/events/history/:channel', function(req, res, next){
		var channel = req.params.channel;
		event.history(channel, {}, {}, function(err, data){
			if(err) return next(error);
			res.send(data);
			return next();
		});
	});
};