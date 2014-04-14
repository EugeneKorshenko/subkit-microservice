module.exports.init = function(server, config, task, helper){

	server.get("/proxy/settings", helper.apiAuth, function(req, res, next){
		res.send(200, {});
	});

	server.post("/proxy/:id", helper.apiAuth, function(req, res, next){
		res.send(201, { status: "sent"});
	});

	server.put("/proxy/:id", helper.apiAuth, function(req, res, next){
		res.send(201, {});
	});
};