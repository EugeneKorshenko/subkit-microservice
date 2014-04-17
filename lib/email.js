'use strict';

module.exports.init = function(server, config, task, helper, doc){
	var email_doc = doc("email", "EMail operations.");
	email_doc.models.SendEMail = {
		id: "EMail",
		properties: {
			recipients:{
				type: "List[string]",
				required: true
			},
			groupid:{
				type: "string"
			},
			templateid:{
				type: "string"
			},
			payload:{
				type: "complex"
			},
			html:{
				type: "string"
			},
			text:{
				type: "string"
			},
			subject:{
				type: "string"
			}
		},
		required: [
			"recipients","groupid","subject"
		]
	};
	email_doc.post("/email/send", "Send a email.", {
	    nickname: "sendEmail",
		responseClass: "void",
		notes: '',
		parameters: [
			{name: "SendEMail", description: "A EMail object.", required:true, dataType: "SendEMail", paramType: "body"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});
	email_doc.put("/email/verify/addess/{id}", "Verify a email address.", {
	    nickname: "verifyEMailAddress",
		responseClass: "void",
		notes: '',
		parameters: [
			{name: "id", description: "EMail address.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});
	email_doc.put("/email/verify/domain/{id}", "Verify a email domain.", {
	    nickname: "verifyEMailDomain",
		responseClass: "void",
		notes: '',
		parameters: [
			{name: "id", description: "Domain name.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});

	server.get("/email/settings", helper.apiAuth, function(req, res, next){
		res.send(200, {});
	});
	server.post("/email/send", helper.apiAuth, function(req, res, next){
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
		res.send(201, { status: "sent"});
	});
	server.put("/email/verify/addess/:id", helper.apiAuth, function(req, res, next){
		var address = req.params.id;
		console.log(address);
		res.send(202, {});
	});
	server.put("/email/verify/domain/:id", helper.apiAuth, function(req, res, next){
		var domain = req.params.id;
		console.log(domain);
		res.send(202, {});
	});
};