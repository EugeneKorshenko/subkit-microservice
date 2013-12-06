module.exports.init = function(storage, pubsub){
	
	var _liveProjections = {};

	storage.onChange(function(data){
		var channelFromKey = data.key.split("!")[0];
		pubsub.publish(channelFromKey, data);
	});

	pubsub.on(function(data){
		if(data.channel !== "eventsource"
		&& data.channel !== "statistics"
		&& data.channel !== "heartbeat"
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
				var channelFromKey = result[event].key.split("!")[0];
				var value = result[event].value;
				if(patternMatch[channelFromKey]) {
					patternMatch[channelFromKey](state, value);	
				} 
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
		projection: _addLiveProjection,
		runAdHoc: _runAdHocProjection
	}
}