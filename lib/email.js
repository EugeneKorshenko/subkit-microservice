module.exports.init = function(server, config, email, helper){

	server.get("/email/settings", function(req, res, next){
		res.send(200, {});
	});

	server.post("/email/send", function(req, res, next){
		var recipients = req.body.recipients;
		var groupid = req.body.groupid;

		var templateid = req.body.templateid;
		var payload = req.body.data || {};

		var html = req.body.html || "";
		var text = req.body.text || "";
		var subject = req.body.subject || "";

		email.send(recipients[0], templateid, payload, subject, text, html, function(err, data){
			if(err) return next(new Error(err.message));
			res.send(202, { status: "sent"});
		});
	});

	server.post("/email/send2", function(req, res, next){
		var recipients = req.body.recipients;
		var groupid = req.body.groupid;

		var templateid = req.body.templateid;
		var payload = req.body.data || {};

		var html = req.body.html || "";
		var text = req.body.text || "";
		var subject = req.body.subject || "";

		email.send(recipients[0], templateid, payload, subject, text, html, function(err, data){
			if(err) return next(new Error(err.message));
			res.send(202, { status: "sent"});
		});
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