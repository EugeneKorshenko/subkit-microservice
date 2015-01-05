'use strict';

var Transform = require('stream').Transform,
    inherits = require('util').inherits,
    microtime = require('microtime'),
    _ = require('underscore'),
    uuid = require('node-uuid'),
	jsonquery = require('./jsonquery.js');

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
				       		clientStreams[index].ref(null, message, index);
				       		if(!clientStreams[index].isPersistentBinding){
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

	var emit = function(stream, message, metadata, persistent){
		pushStream.push({
			$name: stream,
			$stream: stream,
			$persistent: persistent || false,
			$key: microtime.now(),
			$metadata: metadata || {},
			$payload: message || {}
		});
	};

	var bind = function(stream, callback){
		if(!streams[stream]) streams[stream] = {};
		if(!streams[stream].clients) streams[stream].clients = {};

		streams[stream].clients[uuid.v4()] = { 
			ref: callback,
			isPersistentBinding: false 
		};
	};
	var bindPersistent = function(stream, callback){
		if(!streams[stream]) streams[stream] = {};
		if(!streams[stream].clients) streams[stream].clients = {};

		streams[stream].clients[uuid.v4()] = { 
			ref: callback,
			isPersistentBinding: true 
		};
	};	
	var bindWebHook = function(stream, clientId){
		if(!streams[stream]) streams[stream] = {};
		if(!streams[stream].clients) streams[stream].clients = {};

		streams[stream].clients[clientId] = { 
			ref: callWebHook,
			isPersistentBinding: true
		};
	};
	var unbindWebHook = function(stream, clientId){
		if(stream 
			&& clientId 
			&& streams[stream] 
			&& streams[stream].clients[clientId])
			delete streams[stream].clients[clientId];
	};
	var on = function(query, callback){
		pushStream.on('data', function(data){
			if(typeof query === 'function') {
				query(data);
			}else{
				var match = jsonquery.match(data, query);
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
		* @param {callback} callback
		*/
		bind: bind,
		/**
		* Persistent bind to a stream.
		* @memberOf module:event#
		* @method bind
		* @param {String} stream - Name of stream.
		* @param {callback} callback
		*/		
		bindPersistent: bindPersistent,
		/**
		* WebHook bind to a stream.
		* @memberOf module:event#
		* @method bindWebHook
		* @param {String} stream - Name of stream.
		* @param {String} clientId - WebHook callback address.
		*/
		bindWebHook: bindWebHook,
		/**
		* Unbind WebHook from a stream.
		* @memberOf module:event#
		* @method unbindWebHook
		* @param {String} stream - Name of stream.
		* @param {String} clientId - WebHook callback address.
		*/
		unbindWebHook: unbindWebHook,		
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
		* @param {String} query - JSON Query
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