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

		if(!stream) return next(400, new Error('Parameter `stream` missing.'));
		
		try { if(where) where = JSON.parse(unescape(where)); } catch(e){ where = null; }

		event.bind(stream, where, function(error, data){
			if(error) return res.send(404, error);
			res.contentType = 'application/json';
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify([data]));
			next();
		});
	});

	server.post('/events/bind/:stream', function(req,res,next){
		var stream = req.params.stream;
		var webhook = req.headers['X-Subkit-Event-WebHook'] || '';
		var where = req.headers['X-Subkit-Event-Filter'];
		
		if(!stream) return next(400, new Error('Parameter `stream` missing.'));
		if(!webhook) return next(400, new Error('Parameter `webhook` missing.'));
		
		try { if(where) where = JSON.parse(unescape(where)); } catch(e){ where = null; }

		event.bindWebHook(stream, webhook, where);
		res.send(201, {message: 'created'});
		next();

	});
	server.del('/events/bind/:stream', function(req,res,next){
		var stream = req.params.stream;
		var webhook = req.headers['X-Subkit-Event-WebHook'];

		if(!stream) return next(400, new Error('Parameter `stream` missing.'));
		if(!webhook) return next(400, new Error('Parameter `webhook` missing.'));

		event.unbindWebHook(stream, webhook);
		res.send(202, {message: 'unbind accepted'});
		next();
	});

	server.post('/events/emit/:stream', function (req, res, next) {
		var stream = req.params.stream;
		var	payload = req.body;
		if(!stream) return next(400, new Error('Parameter `stream` missing.'));
		if(!payload) return next(400, new Error('Parameter `payload` missing.'));

		var isPersistent = req.headers['x-subkit-event-persistent'] || false;
		var metadata = req.headers['x-subkit-event-metadata'] || {};
		
		if(!stream) return next(400, new Error('Parameter `stream` missing.'));

		event.emit(stream, payload, metadata, isPersistent, function(error, data){
			if(error) return res.send(400, error);
			res.send(201, data);
			next();
		});
		
	});

	server.get('/events/log/:stream', function(req, res, next){
		var stream = req.params.stream;
		event.log(stream, {}, {}, function(err, data){
			if(err) return next(400, err);
			res.send(data);
			next();
		});
	});
	server.del('/events/log/:stream', function(req, res, next){
		var stream = req.params.stream;
		event.deleteLog(stream, function(err, data){
			if(err) return next(400, err);
			res.send(202, {message: 'delete accepted'});
			next();
		});
	});

	server.get('/events/streams', function(req,res,next){
		event.getChannels(function(err, data){
			if(err) return next(400, err);
			res.send(200, data);
			next();
		});
	});
	server.get('/events/streams/:clientId', function(req,res,next){
		var clientId = req.params.clientId;
		if(!clientId) next(400, new Error('Parameter `clientId` missing.'));
		
		event.getChannelsByClientId(clientId, function(err, data){
			if(err) return next(400, err);
			res.send(200, data);
			next();
		});
	});
	server.get('/events/clients', function(req,res,next){
		event.getClients(function(err, data){
			if(err) res.send(400, err);
			res.send(200, data);
			next();
		});
	});
	server.get('/events/clients/:stream', function(req,res,next){
		var stream = req.params.stream;
		if(!stream) res.send(400, new Error('Parameter `stream` missing.'));

		event.getClientsByChannel(stream, function(err, data){
			if(err) res.send(400, err);
			res.send(200, data);
			next();
		});
	});

};
