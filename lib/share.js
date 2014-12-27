'use strict';

module.exports.init = function(server, share, doc){
	require('./share.doc.js').init(doc);

	server.get('/shares/identities', function(req, res, next){
		share.listIdentities(function(err, data){
			if(err) return res.send(400);
			res.send(200, data);
		});
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

	server.put('/shares/:name/action/grantread/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.grantReadAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/action/revokeread/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.revokeReadAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/action/grantinsert/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.grantInsertAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/action/revokeinsert/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.revokeInsertAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});	
	server.put('/shares/:name/action/grantupdate/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.grantUpdateAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});	
	server.put('/shares/:name/action/revokeupdate/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.revokeUpdateAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/action/grantdelete/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.grantDeleteAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/action/revokedelete/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` not found.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.revokeDeleteAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/action/revoke/:identity', function(req, res, next){
		var identity = req.params.identity;
		if(!identity) return res.send(400, new Error('Parameter `identity` not found.'));

		share.revokeAccess(identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
};