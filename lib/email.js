var fs = require("fs"),
	path = require("path"),
	simplesmtp = require("simplesmtp"),
	MailComposer = require("mailcomposer").MailComposer;

module.exports.init = function(server, config, storage, renderer, helper){
	var pool = simplesmtp.createClientPool(config.Port, config.SMTPServer, {
		secureConnection: true,
		debug: true,
		auth: {
			user: config.MTPUsername,
			pass: config.SMTPPassword
		}
	});

	server.get("/email/settings", function(req, res, next){
		res.send(200, {});
	});

	server.post("/email/send", function(req, res, next){
		var recipiends = req.body.recipiends;
		var groupid = req.body.groupid;

		var templateid = req.body.templateid;
		var data = req.body.data || {};

		var html = req.body.html || "";
		var text = req.body.text || "";
		var subject = req.body.subject || "";

		var mailcomposer = new MailComposer({forceEmbeddedImages: true});
		renderer.render(templateid, data, function(err, html){
			if(err) return next(new Error(err.message));

			mailcomposer.setMessageOption({
				from: config.senderAddress,
				to: "mike@mikebild.com",
				body: text,
				subject: subject,
				html: html
			});
			pool.sendMail(mailcomposer, function(err, data){
				if(err) return next(new Error(err.message));
				res.send(202, { status: "sent"});
			});

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