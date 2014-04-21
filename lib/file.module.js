'use strict';

var fs = require('fs'),
	spawn = require('child_process').spawn,
	rights;

module.exports.init = function(conf){
	if(!conf) throw new Error('no conf');
	var config = conf;

	//rights
	function writeRights(){
		fs.writeFileSync(config.rightsPath, JSON.stringify(rights, null, 4));
	}
	function readRights(){
		var data = fs.readFileSync(config.rightsPath);
		rights = JSON.parse(data);
	}
	function setPublic(name, callback){
		var match = rights.public.indexOf(name);

		if(match === -1){
			rights.public.push(name);
			writeRights();
			callback(null, {
				grant: true,
				name: name
			});
		}else{
			callback(new Error('store not found'));
		}
	}
	function setPrivate(name, callback){
		var match = rights.public.indexOf(name);

		if(match !== -1){
			rights.public.splice(match, 1);
			writeRights();
			callback(null, {
				grant: false,
				name: name
			});
		}else{
			callback(new Error('store not found'));
		}
	}

		//rights file refresh on change
	fs.watchFile(config.rightsPath, function (curr, prev) {
		console.log('rights file changed - reload.');
		readRights();
	});

	//init
	readRights();

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
		getRights: function(){ return rights; },
		setPublic: setPublic,
		setPrivate: setPrivate,
		readDir: _readDir,
		fileInfo: _fileInfo,
		moveFile: _moveFile,
		writeFile: _writeFile,
		readFile: _readFile,
		delFile: _delFile,
		dirStatistics: _dirStatistics
	};
};