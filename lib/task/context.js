module.exports.init = function(context){
	return {
		read: function(resource, options, callback){
			context.store.read(resource, options, callback);
		},
		create: function(resource, key, payload, callback){
			context.store.create(resource, key, payload, callback);
		},
		update: function(resource, key, payload, callback){
			context.store.update(resource, key, payload, callback);
		},
		del: function(resource, key, callback){
			context.store.del(resource, key, callback);
		},
		json: function(options){
			if(typeof(options)==="string") options = context.hooks[options];
			if(!options) throw Error("No web client config.");
			var restify = require("restify"),
				path = require("path"),
				client = restify.createJsonClient(options);
			return {
				post: function(resource, payload, callback){
					client.post(path.join('/', resource), payload, function(err, req, res, obj) {
						callback(err, obj);
					});
				},
				put: function(resource, payload, callback){
					client.put(path.join('/', resource), payload, function(err, req, res, obj) {
						callback(err, obj);
					});
				},
				get: function(resource, callback){
					client.get(path.join('/', resource), function(err, req, res, obj) {
						callback(err, obj);
					});
				},
				del: function(resource, callback){
					client.del(path.join('/', resource), function(err, req, res, obj) {
						callback(err, obj);
					});
				},
			}
		},
		log: function(text) {
			console.log(text);
		},
		timeout: function(done, ms){
			setTimeout(done, ms);
		},
		interval: function(done, ms){
			return setInterval(done, ms);
		},
		stop: function(ref){
			clearInterval(ref);
		},
		onData: function(callback){
			this.out = callback;
		}
	}
}