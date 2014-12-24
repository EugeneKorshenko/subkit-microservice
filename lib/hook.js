'use strict';

module.exports.init = function(server, hook, doc){
	var hooks_doc = doc('hooks', 'Webhook operations.');
	hooks_doc.models.Value = {
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
	hooks_doc.models.Info = {
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
	hooks_doc.get('/hooks/client/{channel}/{clientId}', 'Receive messages from specified stream and client id.', {
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
	hooks_doc.get('/hooks/client/{clientId}', 'Receive all messages for client id.', {
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
	hooks_doc.post('/hooks/client/publish/{clientId}', 'Publish message to specified client id.', {
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
	hooks_doc.get('/hooks/clients', 'Get all available clients.', {
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
	hooks_doc.get('/hooks/clients/{channel}', 'Get all clients by channel name.', {
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
	hooks_doc.post('/hooks/channel/publish/{channel}', 'Publish message to specified channel.', {
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
	hooks_doc.get('/hooks/channels', 'Get all available channels.', {
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
	hooks_doc.get('/hooks/channels/{clientId}', 'Get all channels by client Id.', {
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
	hooks_doc.get('/hooks/subscribe/{channel}/{clientId}', 'Long-Polling Subscribe to specified channel with a client id.', {
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
	hooks_doc.delete('/hooks/subscribe/{channel}/{clientId}', 'Unsubscribe from specified channel with a client id.', {
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
			hook.publish('heartbeat', count, {value: count});		
		}, 1000);
	})();

	//hooks
	server.get('/hooks/subscribe/:channel/:clientId', function (req, res, next) {
		var channel = req.params.channel,
			clientId = req.params.clientId;

		hook.subscribe(channel, clientId, function(err, data){
			if(err) res.send(404, err);
			res.contentType = 'application/json';
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify([data]));
		});
	});
	server.del('/hooks/subscribe/:channel/:clientId', function(req,res,next){
		var channel = req.params.channel,
			clientId = req.params.clientId;

		if(!channel || !clientId) res.send(404);
		
		hook.unsubscribe(channel, clientId);
		res.send(202);
	});

	server.get('/hooks/channels', function(req,res,next){
		hook.getChannels(function(err, data){
			res.send(200, data);
		});
	});
	server.get('/hooks/channels/:clientId', function(req,res,next){
		var clientId = req.params.clientId;
		if(!clientId) res.send(404);
		
		hook.getChannelsByClientId(clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.post('/hooks/channel/publish/:channel', function (req, res, next) {
		var channel = req.params.channel,
			message = req.body;

		if(message) hook.publish(channel, message);
		res.send(201, {message: 'published'});
	});

	server.get('/hooks/clients', function(req,res,next){
		hook.getClients(function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.get('/hooks/clients/:channel', function(req,res,next){
		var channel = req.params.channel;
		if(!channel) res.send(400);

		hook.getClientsByChannel(channel, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});

	server.post('/hooks/client/publish/:clientId', function (req, res, next) {
		var clientId = req.params.clientId,
			message = req.body;
		
		if(message) hook.send(clientId, message);
		res.send(201, {message: 'sent'});
	});
	server.get('/hooks/client/:channel/:clientId', function (req, res, next) {
		var clientId = req.params.clientId,
			channel = req.params.channel;

		hook.receive(channel, clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.get('/hooks/client/:clientId', function (req, res, next) {
		var clientId = req.params.clientId;

		hook.receiveAll(clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});

	server.get('/hooks/history/:channel', function(req, res, next){
		var channel = req.params.channel;
		hook.history(channel, {}, {}, function(err, data){
			if(err) return next(error);
			res.send(data);
			return next();
		});
	});
};