module.exports.init = function(server, config, task, helper){

	server.get("/mdm/settings", helper.apiAuth, function(req, res, next){
		res.send(200, {});
	});

	server.post("/mdm/:id", helper.apiAuth, function(req, res, next){
		res.send(201, { status: "sent"});
	});

	server.put("/mdm/:id", helper.apiAuth, function(req, res, next){
		res.send(201, {});
	});
};