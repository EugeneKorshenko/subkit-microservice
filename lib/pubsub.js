module.exports.init = function(server, pubsub, helper){
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
}