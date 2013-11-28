var fs = require("fs"),
	path = require("path"),
	simplesmtp = require("simplesmtp"),
	MailComposer = require("mailcomposer").MailComposer;

module.exports.init = function(server, config, helper){
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
		var mailcomposer = new MailComposer();
		console.log(config.senderAddress);
		mailcomposer.setMessageOption({
			from: config.senderAddress,
			to: "mike@mikebild.com",
			body: "Hello world!",
			html: "<b>Hello world!</b>"
		});
		pool.sendMail(mailcomposer, function(err, data){
			res.send(202, {})
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