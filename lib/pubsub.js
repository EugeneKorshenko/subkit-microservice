module.exports.init = function(server, pubsub, storage, es, helper){
	//heartbeat
	(function(){
		var count = 0;
		setInterval(function(){
			count++;
			pubsub.publish("heartbeat", {key:"heartbeat!"+count, value: count});		
		}, 1000);
	})();

	//storage changes
	storage.onChange(function(data){
		var channelFromKey = data.key.split("!")[0];
		pubsub.publish(channelFromKey, data);
	});

	//pubsub
	server.get("/subscribe/:channel/:clientId", helper.apiAuth, function (req, res, next) {
		var channel = req.params.channel,
			clientId = req.params.clientId;

		pubsub.on(channel, clientId, function(err, data){
			if(err) res.send(404, err);
			res.end(JSON.stringify([data]));
		});
	});
	server.post("/subscribe/:channel/:clientId", helper.apiAuth, function (req, res, next) {
		var channel = req.params.channel,
			clientId = req.params.clientId;

		pubsub.subscribe(channel, clientId, {polling: false}, function(err, data){
			if(err) res.send(404, err);
			res.send(201);
		});
	});
	server.del("/subscribe/:channel/:clientId", helper.apiAuth, function(req,res,next){
		var channel = req.params.channel,
			clientId = req.params.clientId;

		if(channel == undefined || clientId  == undefined) res.send(404);
		
		pubsub.unsubscribe(channel, clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(202);
		});
	});

	server.get("/channels", helper.apiAuth, function(req,res,next){
		pubsub.getChannels(function(err, data){
			res.send(200, data);
		});
	});
	server.get("/channels/:clientId", helper.apiAuth, function(req,res,next){
		var clientId = req.params.clientId;
		if(clientId == undefined) res.send(404);
		
		pubsub.getChannelsByClientId(clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});

	server.post("/channel/publish/:channel", helper.apiAuth, function (req, res, next) {
		var channel = req.params.channel
			,message = req.body;

		pubsub.publish(channel, message, function(err, data){
			if(err) return res.send(404, err);
			res.send(201, {});
		});
	});

	server.get("/clients", helper.apiAuth, function(req,res,next){
		pubsub.getClients(function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.get("/clients/:channel", helper.apiAuth, function(req,res,next){
		var channel = req.params.channel;
		if(channel == undefined) res.send(400);

		pubsub.getClientsByChannel(channel, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});

	server.post("/client/publish/:clientId", helper.apiAuth, function (req, res, next) {
		var clientId = req.params.clientId
			,message = req.body;
		
		pubsub.send(clientId, message, function(err, data){
			if(err) res.send(404, err);
			res.send(201, data);
		});
	});
	server.get("/client/:channel/:clientId", helper.apiAuth, function (req, res, next) {
		var clientId = req.params.clientId
			,channel = req.params.channel;

		pubsub.receive(channel, clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
	server.get("/client/:clientId", helper.apiAuth, function (req, res, next) {
		var clientId = req.params.clientId;

		pubsub.receiveAll(clientId, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});
}