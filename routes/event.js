'use strict';

module.exports.init = function(server, event, logger, configuration){

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
			logger.log({
				type: 'webhook',
				status: 'registered',
				webhook: itm.webhook,
				message: 'Webhook registered to: ' + itm.webhook
			});
			event.bindWebHook(itm.stream, unescape(itm.webhook), itm.where, itm.apiKey);
		}
	})();

	// heartbeat
	(function(){
		var count = 0;
		setInterval(function(){
			event.emit('heartbeat', {value: count++});
		}, 5000);
	})();

	//events
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
	server.get('/events/stream', function(req, res){
		var where = req.params.where;
		var size = req.params.size;

		res.writeHead(200, {
			'Transfer-Encoding': 'chunked',
			'Content-Type': 'application/json'
		});
		event
			.eventStream('', where, size)
			.pipe(res);
	});
	server.get('/events/stream/:name', function(req, res){
		var name = req.params.name;
		var where = req.params.where;
		var size = req.params.size;

		res.writeHead(200, {
			'Transfer-Encoding': 'chunked',
			'Content-Type': 'application/json'
		});
		event
			.eventStream(name, where, size)
			.pipe(res);
	});

	server.get('/events/streams', function(req,res,next){
		event.getChannels(function(err, data){
			if(err) return res.send(400, err);
			res.send(200, data);
			next();
		});
	});
			
	server.post('/events/stream/:stream', function(req,res,next){
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
	server.del('/events/stream/:stream', function(req,res,next){
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

	server.get('/events/history/:stream', function (req, res, next){
		var stream = req.params.stream;
		event.log(stream, {}, {}, function(err, data){
			if(err) return res.send(400, err);
			res.send(data);
			next();
		});
	});	
	server.del('/events/history/:stream', function (req, res, next){
		var stream = req.params.stream;
		event.deleteLog(stream, function(err){
			if(err) return res.send(400, err);
			res.send(202, {message: 'delete accepted'});
			next();
		});
	});	
};
