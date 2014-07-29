'use strict';

var _ = require('underscore');
var Flow = require('cflow');
var microtime = require('microtime');
var util = require('util');

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
	var exclusions = ['eventsource','statistics','heartbeat'];

	var Construct = function (constructor, args) {
	    function F() {
	        return constructor.apply(this, args);
	    }
	    F.prototype = constructor.prototype;
	    return new F();
	};

	storage.onChange(function(data){
		var keyParts = data.key.split('!');
		pubsub.publish(keyParts[0], keyParts[1], data);
	});
	pubsub.on(function(data){
		if(exclusions.indexOf(data.channel) === -1) {
			storage.upsert('eventsource', data.key, data.value, function(error){});
		}
	});

	var _fromStreams = function(streams, eventStore){
		var readChain = [];
		if(!util.isArray(streams)) throw new Error('Parameter "streams" should be an Array.')
		if(!eventStore) eventStore = 'eventsource';
			
		readChain.push(function(){ this(null, []); });
		streams.forEach(function(itm){
			readChain.push(function(err, stream){
				var self = this;
                var readOptions = { from: itm + '!' };
                if(itm === eventStore) readOptions = {};
				storage.read(eventStore, readOptions, function(err, data){
					self(err, stream.concat(data || []));
				});
			});
		});

		return {
			history: function(callback){
				readChain.push(function(err, data){
					var state = {};	
					var result = _.sortBy(data, function(itm){
						var parts = itm.key.split('!');
						return parts[2];
					});
					callback(err, result)
				});
				Construct(Flow, readChain);
			},
			run: function(patternMatch, callback){
				readChain.push(function(err, data){
					var state = {};	
					var result = _.sortBy(data, function(itm){
						var parts = itm.key.split('!');
						return parts[2];
					});
					
					if(patternMatch.$init) state = patternMatch.$init(state);
					for(var event in result){
						
						var parts = result[event].key.split('!');
						var streamName = parts[0];
						var messageType = parts[1] || result[event].store;
						var value = result[event].value;
						
						if(patternMatch[messageType]) patternMatch[messageType](state, value);
						else if (patternMatch[streamName]) patternMatch[streamName](state, value);
						else if (patternMatch['$any']) patternMatch['$any'](state, value);
					}
					if(patternMatch.$completed) state = patternMatch.$completed(state);
					callback(err, state);
				});

				Construct(Flow, readChain);
			},
			on: function(patternMatch, callback){
				this.run(patternMatch, function(err, state){
					callback(err, state);
					pubsub.on(function(result){
						if(streams.indexOf(result.channel) !== -1) {
							
							var parts = result.key.split('!');
							var streamName = parts[0];
							var messageType = parts[1] || result[event].store;
							var value = result.value;
							
							if(patternMatch[messageType]) patternMatch[messageType](state, value);
							else if (patternMatch[streamName]) patternMatch[streamName](state, value);
							else if (patternMatch['$any']) patternMatch['$any'](state, value);
							
							if(patternMatch.$completed) state = patternMatch.$completed(state);

							callback(err, state);
						}
					});
				});
			}
		};
	};

	return {
		/**
		* Run a projection from streams.
		* @memberOf module:eventsource#
		* @method fromStreams
		* @param {String} streams - Stream as Array.
		* @param {callback} callback - The callback.
		*/
		fromStreams: _fromStreams
	};
};