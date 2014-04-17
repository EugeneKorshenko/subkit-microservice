'use strict';

module.exports.init = function(server, pubsub, helper, doc){
	var pubsub_doc = doc("pubsub", "PubSub operations.");
	pubsub_doc.models.Value = {
		id: "Value",
		properties: {
		    clientId: {
		    	type: "string"
		    },
		    channel:{
		    	type: "string"
		    },
		    data: {
		    }
  		}
	};
	pubsub_doc.models.Info = {
		id: "Info",
		properties: {
			clientId:{
				type: "string"
			},
			channel:{
				type: "string"
			}
		}
	};
	pubsub_doc.get("/pubsub/client/{channel}/{clientId}", "Receive messages from specified stream and client id.", {
	    nickname: "receive",
		responseClass: "List[Value]",
		parameters: [
			{name: "channel", description: "channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "client id", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/client/{clientId}", "Receive all messages for client id.", {
	    nickname: "receiveAll",
		responseClass: "List[Value]",
		parameters: [
			{name: "clientId", description: "client id", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.post("/pubsub/client/publish/{clientId}", "Publish message to specified client id.", {
	    nickname: "publish",
		parameters: [
			{name: "clientId", description: "The client Id", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "The message data", required:true, dataType: "Value", paramType: "body"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/clients", "Get all available clients.", {
	    nickname: "getClients",
		responseClass: "List[Info]",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/clients/{channel}", "Get all clients by channel name.", {
	    nickname: "getClientsByChannel",
		responseClass: "List[Info]",
		parameters: [
			{name: "channel", description: "Channel name.", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.post("/pubsub/channel/publish/{channel}", "Publish message to specified channel.", {
	    nickname: "publish",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "The message data", required:true, dataType: "Value", paramType: "body"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/channels", "Get all available channels.", {
	    nickname: "getChannels",
		responseClass: "List[Info]",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/channels/{clientId}", "Get all channels by client Id.", {
	    nickname: "getChannelsByClientId",
		responseClass: "List[Info]",
		parameters: [
			{name: "clientId", description: "Client Id.", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/subscribe/{channel}/{clientId}", "Long-Polling Subscribe to specified channel with a client id.", {
	    nickname: "subscribe",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "Your client id", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.post("/pubsub/subscribe/{channel}/{clientId}", "Subscribe to specified channel with a client id.", {
	    nickname: "subscribe",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "Your client id", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.delete("/pubsub/subscribe/{channel}/{clientId}", "Unsubscribe from specified channel with a client id.", {
	    nickname: "unsubscribe",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "Your client id", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});

	//heartbeat
	(function(){
		var count = 0;
		setInterval(function(){
			count++;
			pubsub.publish("heartbeat", count, {value: count});		
		}, 1000);
	})();

	//pubsub
	server.get("/pubsub/subscribe/:channel/:clientId", helper.apiAuth, function (req, res, next) {
		var channel = req.params.channel,
			clientId = req.params.clientId;

		pubsub.subscribe(channel, clientId, function(err, data){
			if(err) res.send(404, err);
			res.contentType = 'application/json';
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify([data]));
		});
	});
	server.post("/pubsub/subscribe/:channel/:clientId", helper.apiAuth, function (req, res, next) {
		var channel = req.params.channel,
			clientId = req.params.clientId;

		pubsub.subscribe(channel, clientId, {polling: false}, function(err, data){
			if(err) res.send(404, err);
			res.send(201);
		});
	});
	server.del("/pubsub/subscribe/:channel/:clientId", helper.apiAuth, function(req,res,next){
		var channel = req.params.channel,
			clientId = req.params.clientId;

		if(channel == undefined || clientId  == undefined) res.send(404);
		
		pubsub.unsubscribe(channel, clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(202);
		});
	});

	server.get("/pubsub/channels", helper.apiAuth, function(req,res,next){
		pubsub.getChannels(function(err, data){
			res.send(200, data);
		});
	});
	server.get("/pubsub/channels/:clientId", helper.apiAuth, function(req,res,next){
		var clientId = req.params.clientId;
		if(clientId == undefined) res.send(404);
		
		pubsub.getChannelsByClientId(clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.post("/pubsub/channel/publish/:channel", helper.apiAuth, function (req, res, next) {
		var channel = req.params.channel
			,message = req.body;

		pubsub.publish(channel, message);
		res.send(201, {status: "published"});
	});

	server.get("/pubsub/clients", helper.apiAuth, function(req,res,next){
		pubsub.getClients(function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.get("/pubsub/clients/:channel", helper.apiAuth, function(req,res,next){
		var channel = req.params.channel;
		if(channel == undefined) res.send(400);

		pubsub.getClientsByChannel(channel, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});

	server.post("/pubsub/client/publish/:clientId", helper.apiAuth, function (req, res, next) {
		var clientId = req.params.clientId
			,message = req.body;
		
		pubsub.send(clientId, message);
		res.send(201, {status: "sent"});
	});
	server.get("/pubsub/client/:channel/:clientId", helper.apiAuth, function (req, res, next) {
		var clientId = req.params.clientId
			,channel = req.params.channel;

		pubsub.receive(channel, clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.get("/pubsub/client/:clientId", helper.apiAuth, function (req, res, next) {
		var clientId = req.params.clientId;

		pubsub.receiveAll(clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
};