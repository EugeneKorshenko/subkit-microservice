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
* Eventsource module.
* @param {Object} store - Store module dependency.
* @param {Object} event - Event module dependency.
*/
module.exports = function (store, event) {
	module.exports.init(store, event);
};

module.exports.init = function(store, event){
	var Construct = function (constructor, args) {
	    function F() {
	        return constructor.apply(this, args);
	    }
	    F.prototype = constructor.prototype;
	    return new F();
	};

	store.onChange(function(data){
		if(data.$payload && data.$payload.$version)
			delete data.$payload.$version;

		var keyParts = data.key.split('!');
		event.publish(keyParts[0], keyParts[1], data);
	});

	event.on(function(data){
		if(!data.$persistent) return;
		store.upsert(data.$name, data.$key, data.$payload, function(error){});
	});

	var _from = function(streams){
		var readChain = [];
		if(!util.isArray(streams)) throw new Error('Parameter "streams" should be an Array.');
			
		readChain.push(function(){ this(null, []); });
		streams.forEach(function(itm){
			readChain.push(function(err, stream){
				var self = this;
				store.query(itm, {}, {}, function(err, data){
					self(err, stream.concat(data.results || []));
				});
			});
		});

		return {
			history: function(callback){
				readChain.push(function(err, data){
					var state = {};	
					var result = _.sortBy(data, function(itm){
						var parts = itm.$key.split('!');
						return parts[2];
					});
					callback(err, result);
				});
				Construct(Flow, readChain);
			},
			run: function(patternMatch, callback){
				readChain.push(function(err, data){
					var state = {};	
					var result = _.sortBy(data, function(itm){
						var parts = itm.$key.split('!');
						return parts[2];
					});
					
					if(patternMatch.$init) state = patternMatch.$init(state);
					for(var event in result){
						
						var parts = result[event].$key.split('!');
						var streamName = parts[0];
						var messageType = parts[1] || result[event].$store;
						var value = result[event].$payload;
						
						if(patternMatch[messageType]) patternMatch[messageType](state, value);
						else if (patternMatch[streamName]) patternMatch[streamName](state, value);
						else if (patternMatch.$any) patternMatch.$any(state, value);
					}
					if(patternMatch.$completed) state = patternMatch.$completed(state);
					callback(err, state);
				});

				Construct(Flow, readChain);
			},
			on: function(patternMatch, callback){
				this.run(patternMatch, function(err, state){
					callback(err, state);
					event.on(function(result){
						if(streams.indexOf(result.$channel) !== -1) {
							
							var parts = result.$key.split('!');
							var streamName = parts[0];
							var messageType = parts[1];
							var value = result.$payload;
							
							if(patternMatch[messageType]) patternMatch[messageType](state, value);
							else if (patternMatch[streamName]) patternMatch[streamName](state, value);
							else if (patternMatch.$any) patternMatch.$any(state, value);
							
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
		* @method from
		* @param {String} stores - Stores as array of strings.
		* @param {callback} callback - The callback.
		*/
		from: _from
	};
};