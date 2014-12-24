var uuid = require('node-uuid'),
	_ = require('underscore'),
	randomString = require('randomstring'),
	q = require('q');

module.exports.init = function(context){
	return {
		store:{
			find: function(resource, options, query, callback){
				var deferred = q.defer();
				context.store.query(resource, options, query, function(error, data){
					if(error) deferred.reject(error);
					else deferred.resolve(data);
				});
				return deferred.promise.nodeify(callback);
			},
			add: function(resource, key, payload, callback){
				var deferred = q.defer();
				context.store.upsert(resource, key, payload, function(error, data){
					if(error) deferred.reject(error);
					else deferred.resolve(data);
				});
				return deferred.promise.nodeify(callback);
			},
			update: function(resource, key, payload, callback){
				var deferred = q.defer();
				context.store.upsert(resource, key, payload, function(error, data){
					if(error) deferred.reject(error);
					else deferred.resolve(data);
				});
				return deferred.promise.nodeify(callback);
			},			
			remove: function(resource, key, callback){
				var deferred = q.defer();
				context.store.del(resource, key, function(error, data){
					if(error) deferred.reject(error);
					else deferred.resolve(data);
				});
				
			}
		},
		json: function(options){
			if(typeof(options)==="string") options = context.event[options];
			if(!options) throw Error("No web client config.");
			var restify = require("restify"),
				path = require("path"),
				client = restify.createJsonClient(options);
			return {
				post: function(resource, payload, callback){
					var deferred = q.defer();
					client.post(path.join('/', resource), payload, function(error, req, res, data) {
						if(error) deferred.reject(error);
						else deferred.resolve(data);
					});
					return deferred.promise.nodeify(callback);
				},
				put: function(resource, payload, callback){
					var deferred = q.defer();
					client.put(path.join('/', resource), payload, function(error, req, res, data) {
						if(error) deferred.reject(error);
						else deferred.resolve(data);
					});
					return deferred.promise.nodeify(callback);
				},
				get: function(resource, callback){
					var deferred = q.defer();					
					client.get(path.join('/', resource), function(error, req, res, data) {
						if(error) deferred.reject(error);
						else deferred.resolve(data);
					});
					return deferred.promise.nodeify(callback);
				},
				del: function(resource, callback){
					var deferred = q.defer();
					client.del(path.join('/', resource), function(error, req, res, data) {
						if(error) deferred.reject(error);
						else deferred.resolve(data);
					});
					return deferred.promise.nodeify(callback);
				},
				on: function(resource, clientId, callback){
					var request = null;
					var count = 1;
					var id = clientId || randomString.generate(8);

					(function _pollRef(){
						request = client.get('/events/subscribe/'+resource+'/'+id, function(error, req, res, actual){
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
		http: function(options){
			if(typeof(options)==="string") options = context.event[options];
			if(!options) throw Error("No web client config.");
			var restify = require("restify"),
				path = require("path"),
				client = restify.createClient(options);
			return {
				post: function(resource, payload, callback){
					var deferred = q.defer();
					client.post(resource, payload, function(error, req, res, data) {
						if(error) deferred.reject(error);
						else deferred.resolve(data);
					});
					return deferred.promise.nodeify(callback);
				},
				put: function(resource, payload, callback){
					var deferred = q.defer();					
					client.put(resource, payload, function(error, req, res, data) {
						if(error) deferred.reject(error);
						else deferred.resolve(data);
					});
					return deferred.promise.nodeify(callback);
				},
				get: function(resource, callback){
					var deferred = q.defer();					
					client.get(resource, function(error, req, res, data) {
						if(error) deferred.reject(error);
						else deferred.resolve(data);
					});
					return deferred.promise.nodeify(callback);					
				},
				del: function(resource, callback){
					var deferred = q.defer();					
					client.del(resource, function(error, req, res, data) {
						if(error) deferred.reject(error);
						else deferred.resolve(data);
					});
					return deferred.promise.nodeify(callback);					
				}
			}
		},
		event: {
			publish: context.event.publish,
			on: context.event.on
		},
		eventsource: {
			from: context.eventsource.from
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
		onResponse: function(responseCallback, logCallback){
			this.response = responseCallback;
			this.log = logCallback;
		}
	};
};
