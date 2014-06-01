'use strict';

var fs = require('fs'),
	spawn = require('child_process').spawn;

module.exports.init = function(){

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

	return {
		readDir: _readDir,
		fileInfo: _fileInfo,
		moveFile: _moveFile,
		writeFile: _writeFile,
		readFile: _readFile,
		delFile: _delFile,
		dirStatistics: _dirStatistics
	};
};