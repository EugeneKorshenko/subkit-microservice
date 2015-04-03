'use strict';

var Transform = require('stream').Transform;
var inherits = require('util').inherits;
var microtime = require('microtime');
var es = require('event-stream');
var stringify = require('json-stringify-safe');

inherits(LogStream, Transform);
function LogStream() {
	Transform.call(this, {
        objectMode: true
    });
}
LogStream.prototype._transform = function (chunk, encoding, done) {
	done();
};

module.exports.init = function(){

	var stream = new LogStream();
	stream
		.pipe(es.mapSync(function(itm){
			return stringify(itm, null, 4);
		}))
		.pipe(process.stdout);

	return {
		log: log,
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

	function logStream(){
		return stream
			.pipe(es.through(function(data){
				if(!this.logs) this.logs = [];
				this.logs.unshift(data);			
				if(this.logs.length === 10) this.logs.pop();
				this.queue(this.logs);
			}))
			.pipe(es.stringify())			
			.pipe(es.map(function(value, cb){
				cb(null, value + '\n\n');
			}));		
	}	
		
}