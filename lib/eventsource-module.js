module.exports.init = function(storage, pubsub){
	
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
		reduce: _reduce
	}
}