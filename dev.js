'use strict';

var server = require('./server.js').init();
module.exports.getContext = server.getContext;