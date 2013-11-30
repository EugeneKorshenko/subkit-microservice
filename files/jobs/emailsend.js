for(var index in params.recipients){
	email.send(params.recipients[index], params.templateid, params.payload, params.subject, params.text, params.html);
}