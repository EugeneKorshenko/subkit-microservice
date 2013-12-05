module.exports.init = function(storage, pubsub){
	
	var _projections = {};

	storage.onChange(function(data){
		var channelFromKey = data.key.split("!")[0];
		pubsub.emit("store", channelFromKey, data);
	});

	pubsub.on(function(data){
		if(data.source){
			if(data.channel !== "eventsource"
			&& data.channel !== "statistics")
				_append(data.source + "!" + data.channel, data);
		}
	});

	pubsub.on(function(data){
		setTimeout(function(){
			for(var z in _projections){
				var projection = _projections[z];
				patternMatch = projection.patternMatch;

				if(!projection.state && patternMatch.$init) projection.state = patternMatch.$init({});
				if(patternMatch[data.channel]) patternMatch[data.channel](projection.state, data);
				if(patternMatch.$completed) patternMatch.$completed(projection.state);
			}
		}, 0);
	});

	var _getState = function(projectionName){
		if(_projections[projectionName]) return _projections[projectionName].state;
		return {};
	}

	var _projection = function(projectionName, patternMatch){
		if(_projections[projectionName]) return _projections[projectionName].patternMatch = patternMatch;
		_projections[projectionName] = {
			patternMatch: patternMatch
		};
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
		projection: _projection
	}
}