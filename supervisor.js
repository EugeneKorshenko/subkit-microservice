'use strict';

var fs = require('fs'),
    path = require('path'),
    forever = require('forever'),
    helper = require('./lib/helper.js').init();

process.env.NODE_ENV = 'production';
var logsPath = 'files/logs/';
var logsFullPath = path.join(__dirname,logsPath);

if(!fs.existsSync(logsFullPath))
    helper.mkdirRecursive(logsFullPath);

var child = new(forever.Monitor)('index.js', {
    'silent': false,
    'uid':'master',
    'pidFile': 'app.pid',
    'logFile': logsPath + 'proc.log.txt',
    'outFile': logsPath + 'out.log.txt',
    'errFile': logsPath + 'err.log.txt'
});
child.start();
forever.startServer(child);