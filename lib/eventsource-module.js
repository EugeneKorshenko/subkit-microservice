var uuid = require("node-uuid");

module.exports.init = function(storage, pubsub){
	storage.onChange(function(data){
		//WRITE STORAGE CHANGES
		if(data.key.indexOf("eventsource") === -1) {
			_append(data.key, data);
		}
	});

	pubsub.on(function(data){
		//WRITE PUB/SUB CHANGES
		if((data.channel !== 'eventsource')
		&& (data.channel !== 'heartbeat')
		&& (data.channel !== 'statistics')
		&& (data.data.type !== 'put')
		&& (data.data.type !== 'del')
		) {
			_append(data.channel, data);
		}
	});

	var _append = function(key, value){
		key += "!" + uuid.v1();
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