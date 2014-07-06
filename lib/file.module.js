'use strict';

var fs = require('fs'),
	path = require('path'),
	spawn = require('child_process').spawn;

module.exports.init = function(conf){
	var config = conf;
	
	var _mkdirRecursive = function(dirPath, mode) {
        try{
            fs.mkdirSync(dirPath, mode);
        }catch(e){
            if(e && e.errno === 34){
                _mkdirRecursive(path.dirname(dirPath), mode);
                _mkdirRecursive(dirPath, mode);
            }
        }
    };

	var _init = function(fileConfig){
		config = fileConfig;

        if(!fs.existsSync(config.staticsPath))
            _mkdirRecursive(config.staticsPath);
	};
	_init(config);

	var _readDir = function(srcPath, callback){
		fs.readdir(srcPath, callback);
	};
	var _fileInfo = function(srcPath){
		return fs.statSync(srcPath);
	};
	var _moveFile = function(srcPath, destPath, callback){
		fs.rename(srcPath, destPath, callback);
	};
	var _writeFile = function(srcPath, data, callback){
		fs.writeFile(srcPath, data, callback);
	};
	var _readFile = function(srcPath, callback){
		fs.readFile(srcPath, callback);
	};
	var _delFile = function(srcPath, callback){
		fs.unlink(srcPath, callback);
	};
	var _dirStatistics = function(srcPath, callback){
		var sizeProcess = spawn('du', ['-sk', srcPath]);

		sizeProcess.stdout.on('data', function (data) {
			var size = data.toString().replace(/[a-zA-Z\/_.]/g,'').replace(/^\s+|\s+$/g, '');
			callback(null, Math.floor(size));
		});

		sizeProcess.stderr.on('data', function (err) {
			callback(err);
		});
	};

	var _list = function(callback){
		_readDir(config.staticsPath, callback);
	};
	var _read = function(name, callback){
		var fullPath = path.join(config.staticsPath, name);
		_readFile(fullPath, function(err, data){
			callback(err, data.toString());
		});
	};
	var _write = function(name, data, callback){
		var fullPath = path.join(config.staticsPath, name);
		_writeFile(fullPath, data, callback);
	};
	var _del = function(name, callback){
		var fullPath = path.join(config.staticsPath, name);
		_delFile(fullPath, callback);
	};

	return {
		init: _init,
		list: _list,
		read: _read,
		write: _write,
		del: _del,
		readDir: _readDir,
		fileInfo: _fileInfo,
		moveFile: _moveFile,
		writeFile: _writeFile,
		readFile: _readFile,
		delFile: _delFile,
		dirStatistics: _dirStatistics
	};
};