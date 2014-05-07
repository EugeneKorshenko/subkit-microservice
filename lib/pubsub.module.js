'use strict';

var Transform = require('stream').Transform,
    inherits = require('util').inherits,
    microtime = require('microtime');

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
* @module pubsub
*/
/**
 * Async result callback.
 * @callback callback
 * @param {Object} error
 * @param {Object} data
 */
/**
* PubSub module.
* @param {Object} config - Configuration dependency.
* @param {Object} storage - Storage module dependency.
*/
module.exports = function (config, storage) {
	module.exports.init(config, stroage);
};

module.exports.init = function(conf, storage){
	config = conf || {};
	config.pollInterval = conf.pollInterval || 300;

	var channels = {},
		config,
		pushStream = new PushStream();

	pushStream.on('data', function (item){
		try{
			if(item.clientId){
				for(var channel in channels){
					var currentStream = channels[channel];
					if(currentStream.clients[item.clientId]) {
						currentStream.clients[item.clientId].ref(null, item);
						delete currentStream.clients[item.clientId];
					}
				}
			}
			else if(item.channel && channels[item.channel] && channels[item.channel].clients){
	        	var clientchannels = channels[item.channel].clients;
		       	for(var index in clientchannels){
		       		clientchannels[index].ref(null, item);
		       		delete clientchannels[index];
		       	}
	       	} else if(item.channel && !channels[item.channel]){
				channels[item.channel] = {};
			}
		}catch(e){}
	});

	var _generateKey = function(){ 
		return microtime.now() + '!' + Math.random().toString(16).slice(2);
	};

	var subscribe = function(channel, clientId, callback){
		if(!channels[channel]) channels[channel] = {};
		if(!channels[channel].clients) channels[channel].clients = {};
		channels[channel].clients[clientId] = { ref: callback };
	};
	var publish = function(channel, key, message){
		var msg = {
			timestamp: Date.now(),
			version: microtime.now(),
			channel: channel,
			name: channel
		};
		if(arguments.length === 2){
			msg.key = channel + '!' + _generateKey();
			msg.value = key;
		} else {
			msg.key = channel + '!' + key + '!' + _generateKey();
			msg.value = message;
		}
		pushStream.push(msg);
	};
	var send = function(clientId, message){
		var msg = {
			timestamp: Date.now(),
			version: microtime.now(),
			key: clientId + '!' + _generateKey(),
			clientId: clientId,
			name: clientId,
			value: message
		};
		pushStream.push(msg);
	};
	var on = function(callback){
		pushStream.on('data', callback);
	};
	var once = function(callback){
		pushStream.once('data', callback);
	};
	var unsubscribe = function(channel, clientId){
		if(channel 
			&& clientId 
			&& channels[channel] 
			&& channels[channel].clients[clientId])
			delete channels[channel].clients[clientId];
	};
	var getChannels = function (callback){
		var result = [];
		for(var index in channels){
			result.push({ channel:index });
		}
		if(callback) callback(undefined, result);
		return result;
	};
	var getChannelsByClientId = function(clientId, callback){
		var result = [];
		for(var channelIndex in channels){
			for(var clientIndex in channels[channelIndex].clients) {
				if(clientId === clientIndex){
					result.push({clientId: clientIndex, channel: channelIndex});
				}
			}
		}
		if(callback) callback(undefined, result);
		return result;
	};
	var getClients = function(callback){
		var result = [];
		for(var channelIndex in channels){
			for(var clientIndex in channels[channelIndex].clients) {
				result.push({clientId: clientIndex, channel: channelIndex});
			}
		}
		if(callback) callback(undefined, result);
		return result;
	};
	var getClientsByChannel = function(channel, callback){
		var result = [];
		for(var channelIndex in channels){
			if(channelIndex === channel){
				for(var clientIndex in channels[channelIndex].clients) {
					result.push({clientId: clientIndex, channel: channelIndex});
				}
			}
		}
		if(callback) callback(undefined, result);
		return result;
	};
	var _getTranscript = function(resource, options, queryString, callback){
		if(resource && !options) options = {};
		options.from = resource;

		if(!queryString) queryString = {};

		storage.query('eventsource', options, queryString, function(err, data){
			var result = data.reverse();
			callback(err, result);
		});
	};
	
	return {
		/**
		* Unsubscribe from a channel.
		* @memberOf module:pubsub#
		* @method unsubscribe
		* @param {String} channel - Name of channel.
		* @param {String} clientId - Unique client key.
		*/
		unsubscribe: unsubscribe,
		/**
		* Subscribe to a channel.
		* @memberOf module:pubsub#
		* @method subscribe
		* @param {String} channel - Name of channel.
		* @param {String} clientId - Unique client key.
		* @param {callback} callback
		*/
		subscribe: subscribe,
		/**
		* Publish (Fanout) a message to a channel.
		* @memberOf module:pubsub#
		* @method publish
		* @param {String} channel - Name of channel.
		* @param {String} key - Unique message key.
		* @param {Object} message - The message payload.
		*/		
		publish: publish,
		/**
		* Send (Point-to-point) a message to a unique client key.
		* @memberOf module:pubsub#
		* @method send
		* @param {String} clientId - Receiver client key.
		* @param {Object} message - The message payload.
		*/
		send:send,
		/**
		* Hook into the raw message stream.
		* @memberOf module:pubsub#
		* @method on
		* @param {callback} callback
		*/		
		on:on,
		/**
		* Hook into the raw message stream once.
		* @memberOf module:pubsub#
		* @method once
		* @param {callback} callback
		*/
		once:once,
		/**
		* Get all available channels.
		* @memberOf module:pubsub#
		* @method getChannels
		* @param {callback} callback
		*/		
		getChannels: getChannels,
		/**
		* Get all available clients.
		* @memberOf module:pubsub#
		* @method getClients
		* @param {callback} callback
		*/			
		getClients:getClients,
		/**
		* Get channels grouped by client key.
		* @memberOf module:pubsub#
		* @method getChannelsByClientId
		* @param {String} clientId
		* @param {callback} callback
		*/		
		getChannelsByClientId: getChannelsByClientId,
		/**
		* Get clients grouped by channel name.
		* @memberOf module:pubsub#
		* @method getClientsByChannel
		* @param {String} channel
		* @param {callback} callback
		*/
		getClientsByChannel:getClientsByChannel,
		/**
		* Get messages from a channel by using a json query. 
		* @memberOf module:pubsub#
		* @method getTranscript		
		* @param {String} resource - Name of channel.
		* @param {Object} options - Query options.
		* @param {String} queryString - JSON Query options.
		* @param {callback} callback - Done handler.
		*/
		getTranscript:_getTranscript
	};
};