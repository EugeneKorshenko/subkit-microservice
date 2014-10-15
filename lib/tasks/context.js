var uuid = require('node-uuid'),
	_ = require('underscore'),
	randomString = require('randomstring'),
	q = require('q');

module.exports.init = function(context){
	return {
		store:{
			read: function(resource, options, callback){
				var deferred = q.defer();
				context.store.read(resource, options, function(error, data){
					if(error) deferred.reject(error);
					else deferred.resolve(data);
				});
				return deferred.promise.nodeify(callback);
			},
			query: function(resource, options, queryString, callback){
				var deferred = q.defer();
				context.store.query(resource, options, queryString, function(error, data){
					if(error) deferred.reject(error);
					else deferred.resolve(data);
				});
				return deferred.promise.nodeify(callback);
			},
			upsert: function(resource, key, payload, callback){
				var deferred = q.defer();
				context.store.upsert(resource, key, payload, function(error, data){
					if(error) deferred.reject(error);
					else deferred.resolve(data);
				});
				return deferred.promise.nodeify(callback);
			},
			del: function(resource, key, callback){
				var deferred = q.defer();
				context.store.del(resource, key, function(error, data){
					if(error) deferred.reject(error);
					else deferred.resolve(data);
				});
				return deferred.promise.nodeify(callback);
			}
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
				on: function(resource, clientId, callback){
					var request = null;
					var count = 1;
					var id = clientId || randomString.generate(8);

					(function _pollRef(){
						request = client.get('/pubsub/subscribe/'+resource+'/'+id, function(error, req, res, actual){
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
		file: {
			list: context.file.list,
			read: context.file.read,
			write: context.file.write,
			del: context.file.del,
		},
		template: {
			render: context.file.render,
		},

		timeout: setTimeout,
		stop: clearTimeout,
		debug: console.log,
		uuid: uuid,
		_:_,
		randomString:randomString,
		q: q,
		onData: function(doneCallback, logCallback){
			this.done = doneCallback;
			this.log = logCallback;
		}
	};
};