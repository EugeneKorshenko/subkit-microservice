var uuid = require('node-uuid'),
	_ = require('underscore'),
	randomString = require('randomstring'),
	Flow = require('cflow');

module.exports.init = function(context){
	return {
		store:{
			read: context.store.read,
			query: context.store.query,
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
				on: function(resource, clientId, callback){
					var request = null;
					var count = 1;

					(function _pollRef(){
						request = client.get('/pubsub/subscribe/'+resource+'/'+clientId, function(error, req, res, actual){
							try{
								if(res.statusCode === 200){
									count = 1;
									actual.forEach(function(item){
										callback(null, item.value);
									});
									_pollRef(resource, clientId, callback);
								}
							}
							catch(e){
								callback({message: 'Connection error. Retry ' + count});
								setTimeout(function(){_pollRef(resource, clientId, callback);},300*count++);
							}
						});
					})();

					return function(){
						return request;
					};
				}
			}
		},
		messagebus: {
			publish: context.pubsub.publish,
			on: context.pubsub.on
		},
		eventsource: {
			fromStreams: context.eventsource.fromStreams
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