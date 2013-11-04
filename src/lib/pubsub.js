//pubsub
server.get("/subscribe/:channel/:clientId", apiAuth, function (req, res, next) {
	var channel = req.params.channel,
		clientId = req.params.clientId;

	pubsub.subscribe(channel, clientId, { polling: true }, function(error, data){
		if(error) res.send(404, error);
		res.end(JSON.stringify(data));
	});
});
server.post("/subscribe/:channel/:clientId", apiAuth, function (req, res, next) {
	var channel = req.params.channel,
		clientId = req.params.clientId;

	pubsub.subscribe(channel, clientId, { polling: false }, function(error, data){
		if(error) res.send(404, error);
		res.send(201);
	});
});
server.del("/subscribe/:channel/:clientId", apiAuth, function(req,res,next){
	var channel = req.params.channel,
		clientId = req.params.clientId;

	if(channel == undefined || clientId  == undefined) res.send(404);
	
	pubsub.unsubscribe(channel, clientId, function(error, data){
		if(error) res.send(404, error);
		res.send(202);
	});
});

server.get("/channels", apiAuth, function(req,res,next){
	pubsub.getChannels(function(error, data){
		res.send(200, data);
	});
});
server.get("/channels/:clientId", apiAuth, function(req,res,next){
	var clientId = req.params.clientId;
	if(clientId == undefined) res.send(404);
	
	pubsub.getChannelsByClientId(clientId, function(error, data){
		if(error) res.send(404, error);
		res.send(200, data);
	});
});

server.post("/channel/publish/:channel", apiAuth, function (req, res, next) {
	var channel = req.params.channel
		,message = req.body;

	pubsub.publish(channel, message, function(error, data){
		if(error) res.send(404, error);
		res.send(201);
	});
});

server.get("/clients", apiAuth, function(req,res,next){
	pubsub.getClients(function(error, data){
		if(error) res.send(404, error);
		res.send(200, data);
	});
});
server.get("/clients/:channel", apiAuth, function(req,res,next){
	var channel = req.params.channel;
	if(channel == undefined) res.send(400);

	pubsub.getClientsByChannel(channel, function(error, data){
		if(error) res.send(404, error);
		res.send(200, data);
	});
});

server.post("/client/publish/:clientId", apiAuth, function (req, res, next) {
	var clientId = req.params.clientId
		,message = req.body;
	
	pubsub.send(clientId, message, function(error, data){
		if(error) res.send(404, error);
		res.send(201, data);
	});
});
server.get("/client/:channel/:clientId", apiAuth, function (req, res, next) {
	var clientId = req.params.clientId
		,channel = req.params.channel;

	pubsub.receive(channel, clientId, function(error, data){
		if(error) res.send(404, error);
		res.send(200, data);
	});
});
server.get("/client/:clientId", apiAuth, function (req, res, next) {
	var clientId = req.params.clientId;

	pubsub.receiveAll(clientId, function(error, data){
		if(error) res.send(404, error);
		res.send(200, data);
	});
});