'use strict';

var Transform = require('stream').Transform;
var inherits = require('util').inherits;
var microtime = require('microtime');
var _ = require('underscore');
var uuid = require('node-uuid');
var	jsonquery = require('jsonquery');

inherits(PushStream, Transform);
function PushStream() {
	Transform.call(this, {
        objectMode: true
    });
}
PushStream.prototype._transform = function (chunk, encoding, done) {
	done();
};

/**
* @module event
*/
/**
 * Async result callback.
 * @callback callback
 * @param {Object} error
 * @param {Object} data
 */
/**
* Event module.
* @param {Object} config - Configuration dependency.
* @param {Object} store - Store module dependency.
*/
module.exports = function (config, store) {
	module.exports.init(config, stroage);
};

module.exports.init = function(conf, store){
	var config = conf || {};
	var streams = {};
	var pushStream = new PushStream();

	pushStream.on('data', function (msg){
		
		(function(message, streamsToEmit){
			setTimeout(function(){
				try{
					var currentStreams = streamsToEmit[message.$stream];
					if(currentStreams && currentStreams.clients){
			        	var clientStreams = currentStreams.clients;
				       	for(var index in clientStreams){
				       		var match = true;
							if(clientStreams[index].JSONquery && message.$payload && Object.keys(message.$payload).length > 0){
								match = jsonquery.match(message.$payload, clientStreams[index].JSONquery);
							} else if(clientStreams[index].JSONquery && message.$metadata && Object.keys(message.$metadata).length > 0){
								match = jsonquery.match(message.$metadata, clientStreams[index].JSONquery);
							}
				       		if(match) clientStreams[index].ref(null, message, index);

				       		if(match && !clientStreams[index].isPersistentBinding){
				       			delete streams[message.$stream].clients[index];
				       		}
				       	}
			       	} else if(!currentStreams){
			       		streams[message.$stream] = {};
					}
				}catch(e){ console.log(e); }
			}, 0);
		})(msg, streams);
	});

	function callWebHook(error, data, clientId){
		console.log('WebHook call to: ' + clientId);
		console.log(error);
		console.log(data);
	}

	var emit = function(stream, message, metadata, persistent, callback){
		if(!stream) return callback(new Error('Parameter `stream` missing.'));
		if(!message) return callback(new Error('Parameter `message` missing.'));

		var data = {
			$name: stream,
			$stream: stream,
			$persistent: persistent || false,
			$key: microtime.now(),
			$metadata: metadata || {},
			$payload: message || {}
		};

		if(!persistent) {
			pushStream.push(data);
			if(callback) callback(null, {message: 'emitted', key: data.$key});
			return;
		} 

		store.update(data.$stream + '-stream', data.$key, _.extend(data.$payload, data.$metadata), function(error, result){
			if (error) return callback(error);
			pushStream.push(data);
			if(callback) callback(null, {message: 'emitted', key: data.$key});
			return;
		});
	};

	var bind = function(stream, JSONquery, callback){
		if(!streams[stream]) streams[stream] = {};
		if(!streams[stream].clients) streams[stream].clients = {};

		streams[stream].clients[uuid.v4()] = { 
			ref: callback,
			JSONquery: JSONquery,
			isPersistentBinding: false 
		};
	};
	var bindPersistent = function(stream, JSONquery, callback){
		if(!streams[stream]) streams[stream] = {};
		if(!streams[stream].clients) streams[stream].clients = {};
		
		var clientId = uuid.v1();
		streams[stream].clients[clientId] = { 
			ref: callback,
			JSONquery: JSONquery,
			isPersistentBinding: true 
		};
		return clientId;
	};	
	var bindWebHook = function(stream, clientId, JSONquery){
		if(!streams[stream]) streams[stream] = {};
		if(!streams[stream].clients) streams[stream].clients = {};

		streams[stream].clients[clientId] = { 
			ref: callWebHook,
			JSONquery: JSONquery,
			isPersistentBinding: true
		};
	};
	var unbind = function(stream, clientId){
		if(stream 
			&& clientId 
			&& streams[stream] 
			&& streams[stream].clients[clientId])
			delete streams[stream].clients[clientId];
	};
	var on = function(JSONquery, callback){
		pushStream.on('data', function(data){
			if(typeof JSONquery === 'function') {
				JSONquery(data);
			}else{
				var match = jsonquery.match(data, JSONquery);
				if(match) callback(data);
			}
		});
	};
	var once = function(callback){
		pushStream.once('data', callback);
	};

	var getChannels = function (callback){
		var result = [];
		for(var index in streams){
			result.push({ stream:index });
		}
		if(callback) callback(undefined, result);
		return result;
	};
	var getChannelsByClientId = function(clientId, callback){
		var result = [];
		for(var streamIndex in streams){
			for(var clientIndex in streams[streamIndex].clients) {
				if(clientId === clientIndex){
					result.push({clientId: clientIndex, stream: streamIndex});
				}
			}
		}
		if(callback) callback(undefined, result);
		return result;
	};
	var getClients = function(callback){
		var result = [];
		for(var streamIndex in streams){
			for(var clientIndex in streams[streamIndex].clients) {
				result.push({clientId: clientIndex, stream: streamIndex});
			}
		}
		if(callback) callback(undefined, result);
		return result;
	};
	var getClientsByChannel = function(stream, callback){
		var result = [];
		for(var streamIndex in streams){
			if(streamIndex === stream){
				for(var clientIndex in streams[streamIndex].clients) {
					result.push({clientId: clientIndex, stream: streamIndex});
				}
			}
		}
		if(callback) callback(undefined, result);
		return result;
	};
	var log = function(resource, options, queryString, callback){
		store.query(resource + '-stream', options || {}, queryString || {}, callback);
	};
	var deleteLog = function(resource, callback){
		store.del(resource + '-stream', null, callback);
	};
	return {
		/**
		* Bind to a stream.
		* @memberOf module:event#
		* @method bind
		* @param {String} stream - Name of stream.
		* @param {Object} JSONquery - JSONquery event filter.
		* @param {callback} callback
		*/
		bind: bind,
		/**
		* Persistent bind to a stream.
		* @memberOf module:event#
		* @method bindPersistent
		* @param {String} stream - Name of stream.
		* @param {Object} JSONquery - JSONquery event filter.
		* @param {callback} callback
		*/		
		bindPersistent: bindPersistent,
		/**
		* WebHook bind to a stream.
		* @memberOf module:event#
		* @method bindWebHook
		* @param {String} stream - Name of stream.
		* @param {Object} JSONquery - JSONquery event filter.
		* @param {String} clientId - WebHook callback address.
		*/
		bindWebHook: bindWebHook,
		/**
		* Unbind from a stream.
		* @memberOf module:event#
		* @method unbind
		* @param {String} stream - Name of stream.
		* @param {String} clientId - WebHook callback address.
		*/
		unbind: unbind,		
		/**
		* Publish (Fanout) a message to a stream.
		* @memberOf module:event#
		* @method emit
		* @param {String} stream - Name of stream.
		* @param {Object} message - The message payload.
		* @param {Object} metadata - The message metadata.
		* @param {Bool} persistent - Persist message to store.
		*/		
		emit: emit,
		/**
		* Hook into the raw message stream.
		* @memberOf module:event#
		* @method on
		* @param {Object} JSONquery - JSONquery event filter.
		* @param {callback} callback
		*/		
		on:on,
		/**
		* Hook into the raw message stream once.
		* @memberOf module:event#
		* @method once
		* @param {callback} callback
		*/
		once:once,
		/**
		* Get all available streams.
		* @memberOf module:event#
		* @method getChannels
		* @param {callback} callback
		*/		
		getChannels: getChannels,
		/**
		* Get all available clients.
		* @memberOf module:event#
		* @method getClients
		* @param {callback} callback
		*/			
		getClients:getClients,
		/**
		* Get streams grouped by client key.
		* @memberOf module:event#
		* @method getChannelsByClientId
		* @param {String} clientId
		* @param {callback} callback
		*/		
		getChannelsByClientId: getChannelsByClientId,
		/**
		* Get clients grouped by stream name.
		* @memberOf module:event#
		* @method getClientsByChannel
		* @param {String} stream
		* @param {callback} callback
		*/
		getClientsByChannel:getClientsByChannel,
		/**
		* Get events from a persistent stream by using a json query. 
		* @memberOf module:event#
		* @method log		
		* @param {String} resource - Name of stream.
		* @param {Object} options - Query options.
		* @param {String} queryString - JSON Query options.
		* @param {callback} callback - Done handler.
		*/
		log:log,
		/**
		* Delete all events from a persistent stream. 
		* @memberOf module:event#
		* @method log		
		* @param {String} resource - Name of stream.
		* @param {callback} callback - Done handler.
		*/		
		deleteLog:deleteLog
	};
};