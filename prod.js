'use strict';

var fs = require('fs'),
    path = require('path'),
    forever = require('forever'),
    utils = require('./lib/utils.module.js').init();

process.env.NODE_ENV = 'production';
var logsPath = 'files/logs/';
var logsFullPath = path.join(__dirname,logsPath);

if(!fs.existsSync(logsFullPath))
    utils.mkdirRecursive(logsFullPath);

forever.startDaemon(path.join(__dirname,'index.js'), {
    silent: false,
    uid: 'master',
    cwd: path.join(__dirname),
    pidFile: 'app.pid',
    logFile: path.join(logsFullPath, 'proc.log.txt'),
    outFile: path.join(logsFullPath, 'out.log.txt'),
    errFile: path.join(logsFullPath, 'err.log.txt')
});