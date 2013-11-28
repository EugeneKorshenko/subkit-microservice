var path = require("path"),
	fs = require("fs"),
	AWS = require("aws-sdk"),
	uuid = require("node-uuid");

var _sendEMail = function (recipients, subject, html, done) {
	if(!recipients) throw new Error("recipients param need.");
	if(!subject) throw new Error("subject param need.");
	if(!html) throw new Error("html param need.");

	email.sendEmail({
		Source: source,
		Destination: {
			ToAddresses: recipients
		},
		Message: {
			Subject: {
				Data: subject
			},
			Body: {
				Html: {
					Data: html
				}
			}
		}
	}, function(error, response){
		if(done) done(error, true);
	});
};
var _sendTemplate = function (listName, id, templateName, templateData, done){
	db.read(listName, id, function(error, subscriber){
		subscriber = subscriber;
		if(subscriber.confirmed){

			templateData.email = subscriber.email;
			templateData.id = subscriber.id;
			templateData.list = subscriber.list;
			templateData.receivedAt = new Date();

			template.render(templateName, templateData, function(err, html){
				if(err && done) return done(err);

				sendEMail([subscriber.email], templateData.subject, html, function(err, result){
					templateData.sentAt = new Date();
					if(done) done(err, templateData);
				});

			});
		} else {
			if(done) done(new Error("subsciber has not confirmed."));
		}
	});
};
var _subscriberLists = function (done){
	db.list(done);
};
var _addSubscriber = function (emailAddress, listName, id, done){
	var payload = { id: id || uuid.v4(), email: emailAddress, list: listName, confirmed: false, subscribedAt: new Date() };
	db.update(listName, payload.id, payload, function(){
		if(done) done(payload);
	});
};
var _confirmSubscriber = function (listName, id, done){
	db.read(listName, id, function(error, data){
		data.confirmed = true;
		data.confirmedAt = new Date();
		db.update(listName, id, data, function(err, data2){
			if(done) done(err, data);
		});
	});
};
var _listSubscriber = function (listName, id, done) {
	if(id) db.read(listName, id, done);
	else db.read(listName, "", done);
};
var _removeSubscriber = function (listName, id, done) {
	db.del(listName, id, done);
};
var _sendListTemplate = function (listName, templateName, data, done){
	var func = function (subscriber, callback){
					if(subscriber.confirmed){
						var templateData = JSON.parse(JSON.stringify(data));
						async.waterfall([
						    function(callback){
								templateData.email = subscriber.email;
								templateData.id = subscriber.id;
								templateData.list = subscriber.list;
								templateData.templateName = templateName;

						        template.render(templateName, templateData, function(err, html){
						        	templateData.outputHtml = html;
						        	callback(null, templateData)
						        });
						    },
						    function(data, callback){
								sendEMail([subscriber.email], data.subject, data.outputHtml, function(err, state){
									data.sentState = state;
									callback(null, data);								
								});
						    }
						],
						function(err, results){
							callback(err, results);
						});
					}
				};

	db.read(listName, "", function(error, subscribers){
		var subscribers = _.map(subscribers, function(subscriber){ return subscriber.value; });
		async.map(subscribers, func, done);
	});
};
var _verifyEMail = function (callback) {
	email.verifyEmailAddress({
		EmailAddress: source
	}, function(error, response){
		console.log(error);
		console.log(response);
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

module.exports.init = function(conf, storage, templates){
	config = conf;
	AWS.config.update({
		accessKeyId: config.accessKeyId,
		secretAccessKey: config.secretAccessKey,
		region: config.region,
		sslEnabled: true,
		maxRetries: 5
	});

	email = new AWS.SES.Client();
	domain = config.domain;
	source = config.senderAddress + "@" + domain;

	// db = require("./db").init(config);
	// template = require("./template").init(config);

	return {
		verifyEMail: _verifyEMail,
		verifyDomain: _verifyDomain,
		sendEMail: _sendEMail,
		sendTemplate: _sendTemplate,
		addSubscriber: _addSubscriber,
		confirmSubscriber: _confirmSubscriber,
		listSubscriber: _listSubscriber,
		sendListTemplate: _sendListTemplate,
		removeSubscriber: _removeSubscriber,
		subscriberLists: _subscriberLists
	}
};