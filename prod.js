'use strict';

var fs = require('fs');
var path = require('path');
var forever = require('forever');
var utils = require('./lib/utils.module.js').init();

process.env.NODE_ENV = 'production';
var logsPath = 'files/logs/';
var logsFullPath = path.join(__dirname, logsPath);

if(!fs.existsSync(logsFullPath))
    utils.mkdirRecursive(logsFullPath);

forever.startDaemon(path.join(__dirname, 'dev.js'), {
    silent: true,
    uid: 'master',
    cwd: path.join(__dirname),
    pidFile: 'subkit.pid',
    append: true,
    logFile: path.join(logsFullPath, 'proc.log.txt'),
    outFile: path.join(logsFullPath, 'out.log.txt'),
    errFile: path.join(logsFullPath, 'err.log.txt')
});