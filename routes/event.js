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
	server.get('/events/bind/:stream', function (req, res, next) {
		var stream = req.params.stream;
		var where = req.params.where;

		if(!stream) return res.send(400, new Error('Parameter `stream` missing.'));
		
		try { if(where) where = JSON.parse(unescape(where)); } catch(e){ where = null; }

		event.bind(stream, where, function(error, data){
			if(error) return res.send(404, error);
			res.contentType = 'application/json';
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify([data]));
		});
	});

	server.post('/events/bind/:stream', function(req,res,next){
		var stream = req.params.stream;
		var webhook = req.headers['X-Subkit-Event-WebHook'] || '';
		var where = req.headers['X-Subkit-Event-Filter'];
		
		if(!stream) return res.send(400, new Error('Parameter `stream` missing.'));
		if(!webhook) return res.send(400, new Error('Parameter `webhook` missing.'));
		
		event.bindWebHook(stream, webhook, where);
		res.send(201, {message: 'created'});

	});
	server.del('/events/bind/:stream', function(req,res,next){
		var stream = req.params.stream;
		var webhook = req.headers['X-Subkit-Event-WebHook'];

		if(!stream) return res.send(400, new Error('Parameter `stream` missing.'));
		if(!webhook) return res.send(400, new Error('Parameter `webhook` missing.'));

		event.unbindWebHook(stream, clientId);
		res.send(202, {message: 'unbind accepted'});
	});

	server.post('/events/emit/:stream', function (req, res, next) {
		var stream = req.params.stream;
		var	payload = req.body;
		if(!stream) return res.send(400, new Error('Parameter `stream` missing.'));
		if(!payload) return res.send(400, new Error('Parameter `payload` missing.'));

		var isPersistent = req.headers['x-subkit-event-persistent'] || false;
		var metadata = req.headers['x-subkit-event-metadata'] || {};
		
		if(!stream) return res.send(400, new Error('Parameter `stream` missing.'));
		event.emit(stream, payload, metadata, isPersistent);
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