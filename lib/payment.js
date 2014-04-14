module.exports.init = function(server, config, task, helper){

	server.get("/payment/settings", helper.apiAuth, function(req, res, next){
		res.send(200, {});
	});

	server.post("/payment/:id", helper.apiAuth, function(req, res, next){
		res.send(201, { status: "sent"});
	});

	server.put("/payment/:id", helper.apiAuth, function(req, res, next){
		res.send(201, {});
	});
};