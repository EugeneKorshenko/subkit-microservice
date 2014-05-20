var uuid = require('node-uuid');
module.exports.init = function(context){
	return {
		read: function(resource, options, callback){
			context.store.read(resource, options, callback);
		},
		upsert: function(resource, key, payload, callback){
			context.store.upsert(resource, key, payload, callback);
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
						//TODO: log transfer
						console.log(res.headers['content-length']);
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
		pubsub: {
			publish: context.pubsub.publish
		},
		eventsource: {
			projection: context.eventsource.projection,
			live: context.eventsource.live,
			state: context.eventsource.state 
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
		onData: function(doneCallback, logCallback){
			this.done = doneCallback;
			this.log = logCallback;
		}
	};
};