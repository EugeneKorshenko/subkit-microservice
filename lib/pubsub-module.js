var fs = require('fs')
	,Transform = require('stream').Transform
    ,inherits = require('util').inherits;

inherits(PushStream, Transform);
function PushStream () {
	Transform.call(this, {
        objectMode: true
    });
}
PushStream.prototype._transform = function (chunk, encoding, done) {
	done();
};

var channels = {},
	config,
	pushStream = new PushStream();

(function(){
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
	       	} else if(item.channel && (channels[item.channel] == undefined)){
				channels[item.channel] = {};
			}
		}catch(e){}
	});
})();

function _generateKey(){ 
	return Date.now() + '!' + Math.random().toString(16).slice(2);
};

function subscribe(channel, clientId, callback){
	if(channels[channel] == undefined){
		channels[channel] = {};
	}
	if(channels[channel].clients == undefined){
		channels[channel].clients = {};
	}
	channels[channel].clients[clientId] = { ref: callback };
}

function publish(channel, key, message){
	var msg = {
		timestamp: Date.now(),
		channel: channel
	};
	if(arguments.length === 2){
		msg.key = channel + "!" + _generateKey();
		msg.value = key;
	} else {
		msg.key = channel + "!" + key + "!" + _generateKey();
		msg.value = message;
	}
	pushStream.push(msg);
}

function send(clientId, message){
	var msg = {
		timestamp: Date.now(),
		key: clientId + "!" + _generateKey(),
		clientId: clientId,
		value: message
	}
	pushStream.push(msg);
}

function on(callback){
	pushStream.on('data', callback);
}

function unsubscribe(channel, clientId){
	if(channel 
		&& clientId 
		&& channels[channel] 
		&& channels[channel].clients[clientId])
		delete channels[channel].clients[clientId];
}

function getChannels(callback){
	var result = [];
	for(var index in channels){
		result.push({ channel:index });
	}
	if(callback) callback(undefined, result);
	return result;
}

function getChannelsByClientId(clientId, callback){
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
}

function getClients(callback){
	var result = [];
	for(var channelIndex in channels){
		for(var clientIndex in channels[channelIndex].clients) {
			result.push({clientId: clientIndex, channel: channelIndex});
		}
	}
	if(callback) callback(undefined, result);
	return result;
}

function getClientsByChannel(channel, callback){
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
}

module.exports.init = function(conf){
	config = conf || {};
	config.pollInterval = conf.pollInterval || 300;
	return {
		unsubscribe: unsubscribe,
		subscribe: subscribe,
		publish: publish,
		send:send,
		on:on,
		getChannels: getChannels,
		getClients:getClients,
		getChannelsByClientId: getChannelsByClientId,
		getClientsByChannel:getClientsByChannel
	}
}