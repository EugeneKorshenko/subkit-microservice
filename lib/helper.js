var crypto = require("crypto"),
	_ = require("underscore");

module.exports.init = function(admin, api, etag, lastModified, storage){
	function apiAuth(req, res, next){
		//check store, pubsub channel or file path rights
		var resource = req.params[0] || req.params.channel || req.getPath(),
			api_key = req.params.apiKey || req.params.api_Key || req.headers.apikey || req.headers.api_key;

		var isPublic = _.contains(storage.getRights().public, resource);
		if(!isPublic && (api_key !== api.apiKey)) return res.send(401);
		return next();
	}
	function userAuth(req, res, next){
		if(req.username === "anonymous" || req.username !== admin.username || req.authorization.basic.password !== admin.password)
			return res.send(401);
		return next();		
	}
	var setNewETag = function(req, res, next){
		var now = new Date().toString();
		var md5 = crypto.createHash('md5');
		etag = md5.update(now).digest('hex');
		lastModified = now;
		if(next) return next();
	};
	return {
		apiAuth: apiAuth,
		userAuth: userAuth,
		setNewETag: setNewETag
	}
}