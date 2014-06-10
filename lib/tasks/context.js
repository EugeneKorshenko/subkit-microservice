var uuid = require('node-uuid'),
	_ = require('underscore'),
	randomString = require('randomstring'),
	Flow = require('cflow');

module.exports.init = function(context){
	return {
		store:{
			read: context.store.read,
			upsert: context.store.upsert,
			del: context.store.del
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
		messagebus: {
			publish: context.pubsub.publish,
			on: context.pubsub.on
		},
		eventsource: {
			projection: context.eventsource.projection,
			live: context.eventsource.live,
			state: context.eventsource.state 
		},
		timeout: setTimeout,
		interval: setInterval,
		stop: clearInterval,
		debug: console.log,
		uuid: uuid,
		_:_,
		randomString:randomString,
		Flow:Flow,
		onData: function(doneCallback, logCallback){
			this.done = doneCallback;
			this.log = logCallback;
		}
	};
};