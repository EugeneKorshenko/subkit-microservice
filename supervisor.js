'use strict';

var forever = require('forever'),
    child = new(forever.Monitor)('index.js', {
        'silent': false,
        'pidFile': 'app.pid',
        'watch': true,
        'watchDirectory': '.',
        'watchIgnoreDotFiles': true,
        'watchIgnorePatterns': ['*.log.txt','*.pid','masterdb/*','files','node_modules'],
        'logFile': 'proc.log.txt',
        'outFile': 'out.log.txt',
        'errFile': 'err.log.txt'
    });
child.start();
forever.startServer(child);