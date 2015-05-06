'use strict';

var Transform = require('stream').Transform;
var inherits = require('util').inherits;
var microtime = require('microtime');
var es = require('event-stream');
var stringify = require('json-stringify-safe');
var	jsonquery = require('jsonquery');

inherits(LogStream, Transform);
function LogStream() {
	Transform.call(this, {
        objectMode: true
    });
}
LogStream.prototype._transform = function (chunk, encoding, done) {
	done();
};


/**
* @module logger
*/
/**
 * Async result callback.
 * @callback callback
 * @param {Object} error
 * @param {Object} data
 */
/**
* Logger module.
*/
module.exports.init = function(){
	var stream = new LogStream();
	stream.setMaxListeners(0);

	if(process.env.NODE_ENV !== 'test'){
		stream
			.pipe(es.mapSync(function(itm){
				return stringify(itm, null, 4);
			}))
			.pipe(process.stdout);
	}

	return {
		/**
		* Publish a log message.
		* @memberOf module:logger#
		* @method log
		* @param {String} message - Log entry description.
		* @param {Object} params - Log entry metadata.
		*/	
		log: log,
		/**
		* Log stream.
		* @memberOf module:logger#
		* @method logStream
		* @param {Object} JSONquery - JSONquery message filter.
		*/		
		logStream: logStream
	};

	function log(message, params){
		stream.push({
			id: microtime.now(),
			timestamp: new Date().toISOString(),
			message: message,
			params: params
		});
	}

	function logStream(JSONquery, size){
		return stream
			.pipe(es.through(function(itm){
				if(JSONquery) {
					if(jsonquery.match(itm, JSONquery)) this.queue(itm);
				} else this.queue(itm);
			}))		
			.pipe(es.through(function(data){
				if(size) size = parseInt(size);
				else size = 1;

				if(!this.logs) this.logs = [];
				this.logs.unshift(data);			
				if(this.logs.length === size + 1) this.logs.pop();
				this.queue(this.logs);
			}))
			.pipe(es.stringify())			
			.pipe(es.map(function(value, cb){
				cb(null, value + '\n\n');
			}));		
	}	
		
};