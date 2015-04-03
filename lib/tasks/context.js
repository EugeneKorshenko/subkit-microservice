var uuid = require('node-uuid');
var randomString = require('randomstring');
var _ = require('underscore');
var q = require('q');

module.exports.init = function(context, logger){
	var store = {
		stores: function(callback){
			var deferred = q.defer();
			context.store.stores(function(error, data){
				if(error) deferred.reject(error);
				else deferred.resolve(data);
			});
			return deferred.promise.nodeify(callback);
		},
		find: function(resource, options, query, callback){
			var deferred = q.defer();
			context.store.find(resource, options, query, function(error, data){
				if(error) deferred.reject(error);
				else deferred.resolve(data);
			});
			return deferred.promise.nodeify(callback);
		},
		add: function(resource, payload, callback){
			var deferred = q.defer();
			context.store.add(resource, uuid.v1(), payload, function(error, data){
				if(error) deferred.reject(error);
				else deferred.resolve(data);
			});
			return deferred.promise.nodeify(callback);
		},
		update: function(resource, key, payload, callback){
			var deferred = q.defer();
			context.store.update(resource, key, payload, function(error, data){
				if(error) deferred.reject(error);
				else deferred.resolve(data);
			});
			return deferred.promise.nodeify(callback);
		},			
		remove: function(resource, key, callback){
			var deferred = q.defer();
			context.store.remove(resource, key, function(error, data){
				if(error) deferred.reject(error);
				else deferred.resolve(data);
			});
			return deferred.promise.nodeify(callback);
		}
	};
	var json = function(options){
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
	};
	var http = function(options){
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
	};
	var event =  {
		emit: context.event.emit,
		on: context.event.on,
		once: context.event.once
	};
	var eventsource = {
		from: context.eventsource.from
	};
	var file = {
		list: function(callback){
			var deferred = q.defer();
			context.file.list(function(error, data){
				if(error) deferred.reject(error);
				else deferred.resolve(data);
			});
			return deferred.promise.nodeify(callback);
		}, 
		read: function(name, callback){
			var deferred = q.defer();
			context.file.read(name, function(error, data){
				if(error) deferred.reject(error);
				else deferred.resolve(data);
			});
			return deferred.promise.nodeify(callback);
		},
		write: function(name, payload, callback){
			var deferred = q.defer();
			context.file.write(name, payload, function(error, data){
				if(error) deferred.reject(error);
				else deferred.resolve(data);
			});
			return deferred.promise.nodeify(callback);
		},
		remove: function(name, callback){
			var deferred = q.defer();
			context.file.remove(name, function(error, data){
				if(error) deferred.reject(error);
				else deferred.resolve(data);
			});
			return deferred.promise.nodeify(callback);
		}
	};
	var template = {
		render: function(name, options, callback){
			var deferred = q.defer();
			context.template.render(name, options, function(error, data){
				if(error) deferred.reject(error);
				else deferred.resolve(data);
			});
			return deferred.promise.nodeify(callback);
		}
	};
	var util = {		
		uuid: uuid,
		randomString:randomString,
		q: q,
		_:_
	};
	return {
		onDone: function(doneCallback, logCallback){
			this.task.store = store;
			this.task.json = json;
			this.task.http = http;
			this.task.event = event;
			this.task.eventsource = eventsource;
			this.task.file = file;
			this.task.template = template;
			this.task.util = util;
			this.task.done = doneCallback;
			this.task.debug = logCallback;			

			this.log = logger.log;
			this.setTimeout = setTimeout;
			this.setInterval = setInterval;
			this.clearTimeout = clearTimeout;
			this.clearInterval = clearInterval;			
		}
	};
};
