'use strict';

module.exports.init = function(server, share, doc){
	var shares_doc = doc('shares', 'Share operations.');
	shares_doc.models.Share = {
		id: 'Share',
		properties: {
			GET:{
				type: 'List[String]'
			},
			POST:{
				type: 'List[String]'
			},
			PUT:{
				type: 'List[String]'
			},
			DELETE:{
				type: 'List[String]'
			}
		}
	};
	shares_doc.get('/shares/{identity}', 'List all shares by identity.', {
		nickname: 'ReadStores',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'identity', description: 'Name of identity.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});


	server.get('/shares/:identity', function(req, res, next){
		var identity = req.params.identity;
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.listByIdentity(identity, function(err,data){
			if(err) return res.send(400);
			res.send(200, data);
		});
	});
	server.post('/shares/:name', function(req, res, next){
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));

		share.add(name, function(err,data){
			if(err) return res.send(400);
			res.send(201, data);
		});
	});
	server.del('/shares/:name', function(req, res, next){
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));

		share.remove(name, function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});

	server.put('/shares/:name/actions/grantread/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.grantReadAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/actions/revokeread/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.revokeReadAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/actions/grantwrite/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.grantWriteAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/actions/revokewrite/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.revokeWriteAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/actions/grantdelete/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.grantDeleteAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/actions/revokedelete/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.revokeDeleteAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/actions/revoke/:identity', function(req, res, next){
		var identity = req.params.identity;
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.revokeAccess(identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});


};