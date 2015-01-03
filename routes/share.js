'use strict';

module.exports.init = function(server, share, doc){
	require('./doc/share.doc.js').init(doc);

	server.get('/shares/identities', function(req, res, next){
		share.listIdentities(function(err, data){
			if(err) return res.send(400);
			res.send(200, data);
		});
	});
	server.get('/shares/:identity', function(req, res, next){
		var identity = req.params.identity;
		if(!identity) return res.send(400, new Error('Parameter `identity` missing.'));

		share.listByIdentity(identity, function(err,data){
			if(err) return res.send(400);
			res.send(200, data);
		});
	});
	server.post('/shares/:name', function(req, res, next){
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));

		share.add(name, function(err,data){
			if(err) return res.send(400);
			res.send(201, data);
		});
	});
	server.del('/shares/:name', function(req, res, next){
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));

		share.remove(name, function(err,data){
			if(err) return res.send(400);
			res.send(202, {message: 'delete accepted'});
		});
	});

	server.put('/shares/:name/action/grantread/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` missing.'));

		share.grantReadAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/action/revokeread/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` missing.'));

		share.revokeReadAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/action/grantinsert/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` missing.'));

		share.grantInsertAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/action/revokeinsert/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` missing.'));

		share.revokeInsertAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});	
	server.put('/shares/:name/action/grantupdate/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` missing.'));

		share.grantUpdateAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});	
	server.put('/shares/:name/action/revokeupdate/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` missing.'));

		share.revokeUpdateAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/action/grantdelete/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` missing.'));

		share.grantDeleteAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/:name/action/revokedelete/:identity', function(req, res, next){
		var name = req.params.name;
		var identity = req.params.identity;
		if(!name) return res.send(400, new Error('Parameter `name` missing.'));
		if(!identity) return res.send(400, new Error('Parameter `identity` missing.'));

		share.revokeDeleteAccess(name,identity,function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
	server.put('/shares/action/revoke/:identity', function(req, res, next){
		var identity = req.params.identity;
		if(!identity) return res.send(400, new Error('Parameter `identity` missing.'));

		share.revokeAccess(identity, function(err,data){
			if(err) return res.send(400);
			res.send(202, data);
		});
	});
};