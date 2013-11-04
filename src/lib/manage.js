//manage
server.post("/manage/login", userAuth, function (req, res, next) {
	res.send({ api:api, app:app });
	return next();
});
server.put("/manage/change", userAuth, function (req, res, next) {
	api.apiKey = uuid.v4();
	nconf.set('api', api);
	nconf.save(function(err){
		if(err) return next(err);
		res.send({api:api, app:app});
		return next();
	});
});
server.del("/manage/destroy", userAuth, function(req,res,next){
	storage.destroy(function(error){
		if(error) return next(error);
		res.send(202);
		return next();
	});
});
server.post("/manage/import", userAuth, setNewETag, function(req,res,next){
	var payload = req.body;
	storage.imports("", payload, function(error, data){
		if(error) return next(error);
		res.send(201, data);
		return next();
	});
});
server.post("/manage/import/:name", userAuth, setNewETag, function(req,res,next){
	var storeName = req.params.name,
		payload = req.body;
	storage.imports(storeName, payload, function(error, data){
		if(error) return next(error);
		res.send(201, data);
		return next();
	});
});
server.get("/manage/export", userAuth, function(req,res,next){
	storage.exports("", function(error, data){
		if(error) return next(error);
		res.send(200, data);
		return next();
	});
	return next();
});
server.get("/manage/export/:name", userAuth, function(req,res,next){
	var storeName = req.params.name;
	storage.exports(storeName, function(error, data){
		if(error) return next(error);
		res.send(200, data);
		return next();
	});
	return next();
});
server.post("/manage/backup", userAuth, function(req,res,next){
	storage.backup(function(error, data){
		if(error) return next(error);
		res.send(202, data);
		return next();
	});
});
server.post("/manage/restore", userAuth, function(req,res,next){
	var name = req.body.name;
	storage.restore(name, function(error, data){
		if(error) return next(error);
		res.send(202, data);
		return next();
	});
});