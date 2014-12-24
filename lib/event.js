'use strict';

module.exports.init = function(server, event, doc){
	var events_doc = doc('events', 'Event operations.');
	events_doc.models.Value = {
		id: 'Value',
		properties: {
		    clientId: {
		    	type: 'string'
		    },
		    channel:{
		    	type: 'string'
		    },
		    data: {
		    }
  		}
	};
	events_doc.models.Info = {
		id: 'Info',
		properties: {
			clientId:{
				type: 'string'
			},
			channel:{
				type: 'string'
			}
		}
	};
	events_doc.get('/events/client/{channel}/{clientId}', 'Receive messages from specified stream and client id.', {
	    nickname: 'receive',
		responseClass: 'List[Value]',
		parameters: [
			{name: 'channel', description: 'channel name', required:true, dataType: 'string', paramType: 'path'},
			{name: 'clientId', description: 'client id', required:true, dataType: 'string', paramType: 'path'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.get('/events/client/{clientId}', 'Receive all messages for client id.', {
	    nickname: 'receiveAll',
		responseClass: 'List[Value]',
		parameters: [
			{name: 'clientId', description: 'client id', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.post('/events/client/publish/{clientId}', 'Publish message to specified client id.', {
	    nickname: 'publish',
		parameters: [
			{name: 'clientId', description: 'The client Id', required:true, dataType: 'string', paramType: 'path'},
			{name: 'value', description: 'The message data', required:true, dataType: 'Value', paramType: 'body'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.get('/events/clients', 'Get all available clients.', {
	    nickname: 'getClients',
		responseClass: 'List[Info]',
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.get('/events/clients/{channel}', 'Get all clients by channel name.', {
	    nickname: 'getClientsByChannel',
		responseClass: 'List[Info]',
		parameters: [
			{name: 'channel', description: 'Channel name.', required:true, dataType: 'string', paramType: 'path'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.post('/events/channel/publish/{channel}', 'Publish message to specified channel.', {
	    nickname: 'publish',
		parameters: [
			{name: 'channel', description: 'Channel name', required:true, dataType: 'string', paramType: 'path'},
			{name: 'value', description: 'The message data', required:true, dataType: 'Value', paramType: 'body'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.get('/events/channels', 'Get all available channels.', {
	    nickname: 'getChannels',
		responseClass: 'List[Info]',
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.get('/events/channels/{clientId}', 'Get all channels by client Id.', {
	    nickname: 'getChannelsByClientId',
		responseClass: 'List[Info]',
		parameters: [
			{name: 'clientId', description: 'Client Id.', required:true, dataType: 'string', paramType: 'path'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.get('/events/subscribe/{channel}/{clientId}', 'Long-Polling Subscribe to specified channel with a client id.', {
	    nickname: 'subscribe',
		parameters: [
			{name: 'channel', description: 'Channel name', required:true, dataType: 'string', paramType: 'path'},
			{name: 'clientId', description: 'Your client id', required:true, dataType: 'string', paramType: 'path'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.delete('/events/subscribe/{channel}/{clientId}', 'Unsubscribe from specified channel with a client id.', {
	    nickname: 'unsubscribe',
		parameters: [
			{name: 'channel', description: 'Channel name', required:true, dataType: 'string', paramType: 'path'},
			{name: 'clientId', description: 'Your client id', required:true, dataType: 'string', paramType: 'path'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});

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