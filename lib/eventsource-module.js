var uuid = require("node-uuid");

module.exports.init = function(storage, pubsub){
	storage.onChange(function(data){
		if(data.key.indexOf("eventsource") === -1) {
			_append(data.key, data);
		}
	});

	pubsub.on(function(data){
		if((data.indexOf('eventsource') === -1)
		&& (data.indexOf('heartbeat') === -1)
		&& (data.indexOf('"type":"put"') === -1)
		&& (data.indexOf('"type":"del"') === -1)
		&& (data.indexOf('channel') !== -1)
		) {
			var obj = JSON.parse(data);
			_append(obj.channel, obj);
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