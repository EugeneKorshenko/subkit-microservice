'use strict';

module.exports.init = function(server, event, configuration, doc){
	require('./doc/event.doc.js').init(doc);

	var webhooksConfig = configuration.get('webhooks');
	//bind webhooks
	(function(){
		if(!webhooksConfig) {
			webhooksConfig = {};
			configuration.set('webhooks', webhooksConfig);
			configuration.save();
		}
		for(var idx in webhooksConfig){
			var itm = webhooksConfig[idx];
			console.log(itm)
			event.bindWebHook(itm.stream, unescape(itm.webhook), itm.where, itm.apiKey);
		};
	})();

	// heartbeat
	(function(){
		var count = 0;
		setInterval(function(){
			event.emit('heartbeat', {value: count++});
		}, 5000);
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
			next();
		});
	});
	server.post('/events/bind/:stream', function(req,res,next){
		var stream = req.params.stream;
		if(!req.body) req.body = {};
		var webhook = req.body.webhook || req.headers['x-subkit-event-webhook'];
		var where = req.body.filter || req.headers['x-subkit-event-filter'];
		var apiKey = req.body.apikey || req.headers['x-subkit-event-apikey'];
		
		if(!stream) return res.send(400, new Error('Parameter `stream` missing.'));
		if(!webhook) return res.send(400, new Error('Parameter `webhook` missing.'));
		
		try { if(where) where = JSON.parse(unescape(where)); } catch(e){ where = null; }
		
		event.bindWebHook(stream, webhook, where, apiKey);
		
		webhooksConfig[escape(webhook)] = {
			stream: stream,
			webhook: webhook,
			where: where,
			apiKey: apiKey
		};
		configuration.set('webhooks', webhooksConfig);
		configuration.save(function(){
			res.send(201, {message: 'created'});
			next();			
		});
	});
	server.del('/events/bind/:stream', function(req,res,next){
		var stream = req.params.stream;
		if(!req.body) req.body = {};
		var webhook = req.body.webhook || req.headers['x-subkit-event-webhook'];

		if(!stream) return res.send(400, new Error('Parameter `stream` missing.'));
		if(!webhook) return res.send(400, new Error('Parameter `webhook` missing.'));
		event.unbind(stream, webhook);

		delete webhooksConfig[escape(webhook)];
		configuration.set('webhooks', webhooksConfig);
		configuration.save(function(){
			res.send(202, {message: 'delete accepted'});
			next();			
		});
	});

	server.post('/events/emit/:stream', function (req, res, next) {
		var stream = req.params.stream;
		var	payload = req.body;
		if(!stream) return res.send(400, new Error('Parameter `stream` missing.'));
		if(!payload) return res.send(400, new Error('Parameter `payload` missing.'));

		var isPersistent = req.headers['x-subkit-event-persistent'] || false;
		var metadata = req.headers['x-subkit-event-metadata'] || {};
		
		if(!stream) return res.send(400, new Error('Parameter `stream` missing.'));

		event.emit(stream, payload, metadata, isPersistent, function(error, data){
			if(error) return res.send(400, error);
			res.send(201, data);
			next();
		});
	});

	server.get('/events/log/:stream', function(req, res, next){
		var stream = req.params.stream;
		event.log(stream, {}, {}, function(err, data){
			if(err) return res.send(400, err);
			res.send(data);
			next();
		});
	});
	server.del('/events/log/:stream', function(req, res, next){
		var stream = req.params.stream;
		event.deleteLog(stream, function(err){
			if(err) return res.send(400, err);
			res.send(202, {message: 'delete accepted'});
			next();
		});
	});

	server.get('/events/streams', function(req,res,next){
		event.getChannels(function(err, data){
			if(err) return res.send(400, err);
			res.send(200, data);
			next();
		});
	});
	server.get('/events/streams/:clientId', function(req,res,next){
		var clientId = req.params.clientId;
		if(!clientId) next(400, new Error('Parameter `clientId` missing.'));
		
		event.getChannelsByClientId(clientId, function(err, data){
			if(err) return res.send(400, err);
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
