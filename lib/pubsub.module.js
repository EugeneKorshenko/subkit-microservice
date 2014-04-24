'use strict';

var Transform = require('stream').Transform,
    inherits = require('util').inherits;

inherits(PushStream, Transform);
function PushStream() {
	Transform.call(this, {
        objectMode: true
    });
}
PushStream.prototype._transform = function (chunk, encoding, done) {
	done();
};

module.exports.init = function(conf){
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
		return Date.now() + '!' + Math.random().toString(16).slice(2);
	};
	var subscribe = function(channel, clientId, callback){
		if(!channels[channel]) channels[channel] = {};
		if(!channels[channel].clients) channels[channel].clients = {};
		channels[channel].clients[clientId] = { ref: callback };
	};
	var publish = function(channel, key, message){
		var msg = {
			timestamp: Date.now(),
			channel: channel
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
			key: clientId + '!' + _generateKey(),
			clientId: clientId,
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

	return {
		unsubscribe: unsubscribe,
		subscribe: subscribe,
		publish: publish,
		send:send,
		on:on,
		once:once,
		getChannels: getChannels,
		getClients:getClients,
		getChannelsByClientId: getChannelsByClientId,
		getClientsByChannel:getClientsByChannel
	};
};