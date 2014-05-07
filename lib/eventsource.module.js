'use strict';


/**
* @module eventsource
*/

/**
 * Async result callback.
 * @callback callback
 * @param {Object} error
 * @param {Object} data
 */

/**
* eventsource module.
* @param {Object} storage - Store module dependency.
* @param {Object} pubsub - PubSub module dependency.
*/
module.exports = function (storage, pubsub) {
	module.exports.init(config);
};

module.exports.init = function(storage, pubsub){
	
	var _liveProjections = {};
	storage.onChange(function(data){
		var keyParts = data.key.split('!');
		pubsub.publish(keyParts[0], keyParts[1], data);
	});
	pubsub.on(function(data){
		if(data.channel !== 'eventsource'
		&& data.channel !== 'statistics'
		&& data.channel !== 'heartbeat'
		) {
			_append(data.key, data.value);
		}
	});
	pubsub.on(function(data){
		setTimeout(function(){
			for(var projectionName in _liveProjections){
				var projection = _liveProjections[projectionName];
				_runLiveProjection(projectionName, projection, data);
			}
		}, 0);
	});

	var _runLiveProjection = function(projectionName, projection, event){
		var patternMatch = projection.patternMatch;
		var stream = event.key.split('!')[0];
		if(patternMatch[stream]){
			if(!projection.state && patternMatch.$init) projection.state = patternMatch.$init({});
			patternMatch[stream](projection.state, event);
			pubsub.publish(projectionName, projection.state);
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
		storage.read('eventsource', { from: streamName + '!' }, function(err, data){
			var result = data.reverse();
			var state = {};
			if(patternMatch.$init) state = patternMatch.$init(state);
			for(var event in result){
				var messageType = result[event].key.split('!')[1];
				var value = result[event].value;
				
				if(patternMatch[messageType]) patternMatch[messageType](state, value);
				else if (patternMatch[streamName]) patternMatch[streamName](state, value);
			}
			if(patternMatch.$completed) patternMatch.$completed(state);
		});
	};
	var _append = function(key, value){
		storage.upsert('eventsource', key, value, function(error){});
	};
	var _get = function(callback){
		storage.read('eventsource', {}, function(err, data){
			var result = data.reverse();
			callback(err, result);
		});
	};
	var _reduce = function(initial, selector, callback){
		storage.read('eventsource', {}, function(err, data){
			var result = data.reduce(function(previousValue, currentValue, index, array){
			  return previousValue + currentValue;
			}, initial);
			callback(err, result);
		});
	};

	return {
		/**
		* Append a message to log.
		* @memberOf module:eventsource#
		* @method append
		* @param {String} key - Message key.
		* @param {Object} value - Message payload.
		*/
		append: _append,
		/**
		* Get all messages from log.
		* @memberOf module:eventsource#
		* @method get
		* @param {callback} callback
		*/
		get: _get,
		/**
		* Reduce (left fold) message to a state.
		* @memberOf module:eventsource#
		* @method reduce
		* @param {Object} initial - Initial state.
		* @param {Function} selector - A selector function.
		* @param {callback} callback
		*/
		reduce: _reduce,
		/**
		* Gets the current state of projection.
		* @memberOf module:eventsource#
		* @method getState
		* @param {String} projectionName - Name of projection.
		* @return {Object} - Current state of projection.
		*/
		getState: _getState,
		/**
		* Run a projection in live mode.
		* @memberOf module:eventsource#
		* @method runLive
		* @param {String} projectionName - Name of projection.
		* @param {Function} projection - The projection function.
		* @param {Object} - A message to process.
		*/		
		runLive: _addLiveProjection,
		/**
		* Run a projection in adhoc mode.
		* @memberOf module:eventsource#
		* @method runAdHoc
		* @param {String} streamName - Name of message stream.
		* @param {Function} patternMatch - The pattern matching function.
		*/
		runAdHoc: _runAdHocProjection
	};
};