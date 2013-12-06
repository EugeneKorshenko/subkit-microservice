module.exports.init = function(storage, pubsub){
	
	var _liveProjections = {};

	storage.onChange(function(data){
		var keyParts = data.key.split("!");
		var channelFromKey = keyParts[0] + "!" + keyParts[1];
		pubsub.publish(channelFromKey, data);
	});

	pubsub.on(function(data){
		var channelFromKey = data.channel.split("!")[0];
		if(channelFromKey !== "eventsource"
		&& channelFromKey !== "statistics"
		&& channelFromKey !== "heartbeat"
		) {
			_append(data.channel, data.value);
		}
	});

	pubsub.on(function(data){
		setTimeout(function(){
			for(var z in _liveProjections){
				var projection = _liveProjections[z];
				_runLiveProjection(projection, data);
			}
		}, 0);
	});

	var _runLiveProjection = function(projection, event){
		var patternMatch = projection.patternMatch;
		var stream = event.key.split("!")[0];
		if(patternMatch[stream]){
			if(!projection.state && patternMatch.$init) projection.state = patternMatch.$init({});
			patternMatch[stream](projection.state, event);
			if(patternMatch.$completed) patternMatch.$completed(projection.state);
		}
	};

	var _getState = function(projectionName){
		if(_liveProjections[projectionName]) return _liveProjections[projectionName].state;
		return {};
	};

	var _addLiveProjection = function(projectionName, patternMatch){
		if(_liveProjections[projectionName]) return _liveProjections[projectionName].patternMatch = patternMatch;
		_liveProjections[projectionName] = {
			patternMatch: patternMatch
		};
	};

	var _runAdHocProjection = function(streamName, patternMatch){
		storage.read("eventsource", { from: streamName + "!" }, function(err, data){
			var result = data.reverse();
			var state = {};
			if(patternMatch.$init) state = patternMatch.$init(state);
			for(var event in result){
				var messageType = result[event].key.split("!")[1];
				var value = result[event].value;
				
				if(patternMatch[messageType]) patternMatch[messageType](state, value);
				else if (patternMatch[streamName]) patternMatch[streamName](state, value);
			}
			if(patternMatch.$completed) patternMatch.$completed(state);
		});
	};

	var _append = function(key, value){
		key += "!" + Date.now() + '!' + Math.random().toString(16).slice(2);
		storage.create("eventsource", key, value, function(error){});
	};

	var _get = function(callback){
		storage.read("eventsource", {}, function(err, data){
			var result = data.reverse();
			callback(err, result);
		});
	};

	var _reduce = function(initial, selector, callback){
		storage.read("eventsource", {}, function(err, data){
			var result = data.reduce(function(previousValue, currentValue, index, array){
			  return previousValue + currentValue;
			}, initial);
			callback(err, result);
		});
	};

	return {
		append: _append,
		get: _get,
		reduce: _reduce,
		getState: _getState,
		runLive: _addLiveProjection,
		runAdHoc: _runAdHocProjection
	}
}