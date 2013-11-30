module.exports.init = function(server, config, task, helper){

	server.get("/email/settings", function(req, res, next){
		res.send(200, {});
	});

	server.post("/email/send", function(req, res, next){
		var payload = {
			recipients: req.body.recipients || [],
			groupid: req.body.groupid || "",
			templateid: req.body.templateid,
			payload: req.body.data || {},
			html: req.body.html || "",
			text: req.body.text || "",
			subject: req.body.subject || ""
		}

		task.runJob("emailsend", payload, function(err, data){});
		res.send(202, { status: "sent"});
	});

	server.put("/email/verify/addess/:id", function(req, res, next){
		var address = req.params.id;
		console.log(address);
		res.send(202, {});
	});

	server.put("/email/verify/domain/:id", function(req, res, next){
		var domain = req.params.id;
		console.log(domain);
		res.send(202, {});
	});

}