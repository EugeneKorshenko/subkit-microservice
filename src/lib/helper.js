//auth helper
function apiAuth(req, res, next){
	var resource = req.params[0],
		key = req.params[2],
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