'use strict';

var Transform 	= require('stream').Transform;
var inherits 	= require('util').inherits;
var microtime 	= require('microtime');
var _ 			= require('underscore');
var	jsonquery 	= require('jsonquery');
var es 			= require('event-stream');
var restify 	= require('restify');

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
* @param {Object} logger - Logger module dependency.
*/
module.exports = function (config, store, logger) {
	module.exports.init(config, store, logger);
};

module.exports.init = function(conf, store, logger){
	var pushStream = new PushStream();
	var streams = {};

	return {
		/**
		* WebHook bind to a stream.
		* @memberOf module:event#
		* @method bindWebHook
		* @param {String} stream - Name of stream
		* @param {String} webhookId - WebHook callback URL
		* @param {Object} JSONquery - JSONquery message filter
		* @param {String} apikey - WebHook URL API-Key
		*/
		bindWebHook: bindWebHook,
		/**
		* Unbind WebHook from a stream.
		* @memberOf module:event#
		* @method unbindWebHook
		* @param {String} stream - Name of stream
		* @param {String} webhookId - WebHook callback URL
		*/
		unbindWebHook: unbindWebHook,		
		/**
		* Publish a message to a stream.
		* @memberOf module:event#
		* @method emit
		* @param {String} stream - Name of stream
		* @param {Object} payload - The message payload
		* @param {Object} metadata - The message metadata
		* @param {Bool} persistent - Persist message to store
		* @param {callback} callback - Done handler
		*/		
		emit: emit,
		/**
		* Hook into the raw message stream.
		* @memberOf module:event#
		* @method on
		* @param {String} stream - Name of stream
		* @param {Object} JSONquery - JSONquery message filter
		* @param {callback} callback - Done handler
		*/		
		on:on,
		/**
		* Message stream.
		* @memberOf module:event#
		* @method eventStream
		* @param {String} stream - Name of stream
		* @param {Object} JSONquery - JSONquery message filter
		*/		
		eventStream:eventStream,		
		/**
		* Hook into the raw message stream once.
		* @memberOf module:event#
		* @method once
		* @param {String} stream - Name of stream
		* @param {Object} JSONquery - JSONquery message filter
		* @param {callback} callback - Done handler
		*/
		once:once,
		/**
		* Get all available streams.
		* @memberOf module:event#
		* @method getStreams
		* @param {callback} callback - Done handler
		*/		
		getStreams: getStreams,
		/**
		* Get events from a persistent stream by using a json query. 
		* @memberOf module:event#
		* @method log		
		* @param {String} resource - Name of stream
		* @param {Object} options - Query options
		* @param {Object} JSONquery - Filter as JSON-Query
		* @param {callback} callback - Done handler
		*/
		log:log,
		/**
		* Delete all events from a persistent stream. 
		* @memberOf module:event#
		* @method log		
		* @param {String} resource - Name of stream
		* @param {callback} callback - Done handler
		*/		
		deleteLog:deleteLog
	};

	function emit(stream, message, metadata, persistent, callback){
		if(!stream) return callback(new Error('Parameter `stream` missing.'));
		if(!message) return callback(new Error('Parameter `message` missing.'));
		if(!streams[stream]) streams[stream] = {};

		var data = {
			$name: stream,
			$stream: stream,
			$persistent: persistent || false,
			$key: microtime.now(),
			$timestamp: new Date().toISOString(),
			$metadata: metadata || {},
			$payload: message || {}
		};
		
		if(!persistent) {
			pushStream.push(data);
			if(callback) callback(null, {message: 'emitted', key: data.$key});
			return;
		} 

		store.insert(data.$stream + '-stream', data.$key, _.extend(data.$payload, data.$metadata), function(error){
			if (error) return callback(error);
			pushStream.push(data);
			if(callback) callback(null, {message: 'emitted', key: data.$key});
			return;
		});
	}
	function bindWebHook(stream, webhookId, JSONquery, apiKey){		
		if(!streams[stream]) streams[stream] = {};
		if(!streams[stream].clients) streams[stream].clients = {};

		streams[stream].clients[webhookId] = function(data){
			callWebHook(data, webhookId, apiKey);
		};
				
		pushStream
			.pipe(es.through(function(itm){
				if(!stream) this.queue(itm);
				else if(itm.$stream === stream) this.queue(itm);
			}))
			.pipe(es.through(function(itm){	
				var eventPayload = _filterEvent(itm, JSONquery);
				if(eventPayload) this.queue(eventPayload);
			}))	
			.on('data', streams[stream].clients[webhookId]);
	}
	function unbindWebHook(stream, webhookId){
		if(stream 
			&& webhookId 
			&& streams[stream] 
			&& streams[stream].clients[webhookId]){
				pushStream.removeListener('data', streams[stream].clients[webhookId]);
				delete streams[stream].clients[webhookId];
			}			
	}
	function on(stream, JSONquery, callback){
		pushStream
			.pipe(es.through(function(itm){
				if(!stream) this.queue(itm);
				else if(itm.$stream === stream) this.queue(itm);
			}))
			.on('data', function(data) {
				var eventPayload = _filterEvent(data, JSONquery);
				if(eventPayload) callback(null, eventPayload);
			});
	}
	function eventStream(stream, JSONquery, size, order){
		return pushStream
			.pipe(es.through(function(itm){
				if(!stream) this.queue(itm);
				else if(itm.$stream === stream) this.queue(itm);
			}))		
			.pipe(es.through(function(itm){	
				var eventPayload = _filterEvent(itm, JSONquery);
				if(eventPayload) this.queue(eventPayload);
			}))		
			.pipe(es.through(function(data){
				if(size) size = parseInt(size);
				else size = 1;

				if(!this.history) this.history = [];

				if(order === 'ascending') this.history.pop(data);	
				else this.history.unshift(data);			
				
				if(this.history.length === size + 1) this.history.pop();
				this.queue(this.history);
			}))
			.pipe(es.stringify())			
			.pipe(es.map(function(value, cb){
				cb(null, value + '\n\n');
			}));
	}
	function once(stream, JSONquery, callback){
		pushStream
			.pipe(es.through(function(itm){
				if(!stream) this.queue(itm);
				else if(itm.$stream === stream) this.queue(itm);
			}))
			.once('data', function(data){
				var eventPayload = _filterEvent(data, JSONquery);
				if(eventPayload) callback(null, eventPayload);
			});
	}
	function _filterEvent(itm, JSONquery){
		if(!JSONquery) return itm;

		var queryItm = {};
		for(var idx in itm){
			queryItm[idx.replace('$','')] = itm[idx];
		}
		if(jsonquery.match(queryItm, JSONquery)) return itm;
		return null;
	}
	function getStreams(callback){
		var result = [];
		for(var index in streams){
			if(streams[index] && streams[index].clients){
				for(var id in streams[index].clients){					
					var metadata = streams[index].clients[id];
					result.push({
						stream: index,
						id: id,
						where: metadata.JSONquery || null,
						apikey: metadata.apiKey || null
					});
				}
			} else {
				result.push({ stream:index });	
			}
			
		}
		if(callback) callback(undefined, result);
		return result;
	}
	function log(resource, options, queryString, callback){
		store.query(resource + '-stream', options || {}, queryString || {}, callback);
	}
	function deleteLog(resource, callback){
		store.del(resource + '-stream', null, callback);
	}
	function callWebHook(data, webhookId, apiKey){
		var client = restify.createJsonClient({
		  rejectUnauthorized: false,
		  url: webhookId,
		  headers: {
		  	'x-auth-token': apiKey
		  }
		});
		client.post('', data.$payload, function(error, req, res){
			if(error) return logger.log('webhook', {
				type: 'webhook',			
				status: 'error',
				error: error,
				webhook: webhookId,
				message: 'Error WebHook call to: ' + webhookId + ' Error: ' + error
			});

			logger.log('webhook', {
				type: 'webhook',
				status: 'success',
				webhook: webhookId,
				message: 'Successful WebHook call to: ' + webhookId + ' Status code: ' + res.statusCode
			});
		});		
	}
};
