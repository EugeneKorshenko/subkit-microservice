var path = require("path"),
	fs = require("fs"),
	simplesmtp = require("simplesmtp"),
	MailComposer = require("mailcomposer").MailComposer;

module.exports.init = function(config, renderer){
	var pool = simplesmtp.createClientPool(config.Port, config.SMTPServer, {
		secureConnection: true,
		debug: false,
		auth: {
			user: config.MTPUsername,
			pass: config.SMTPPassword
		}
	});

	var _send = function(recipient, templateid, payload, subject, text, html, callback){
		var mailcomposer = new MailComposer({forceEmbeddedImages: true});

		renderer.render(templateid, payload, function(err, data){
			if(err) callback(err);

			mailcomposer.setMessageOption({
				from: config.senderAddress,
				to: recipient,
				body: text,
				subject: subject,
				html: html || data
			});
			pool.sendMail(mailcomposer, callback || function(){});
		});
	};

	var _verifyDomain = function (callback) {
		email.verifyDomainIdentity({
			Domain: domain
		}, function(error, response){
			console.log(error);
			console.log(response);
			//TODO: update dns record with verified in 72h - email notification by amazon
			//_amazonses.domain.com TXT '"' + response.VerificationToken + '"'
		});
	};


	return {
		send: _send
	}
};