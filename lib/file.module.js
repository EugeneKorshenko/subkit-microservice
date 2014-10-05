'use strict';

var fs = require('fs'),
	path = require('path'),
	fstream = require('fstream'),
	tar = require('tar'),
	zlib = require('zlib'),
	spawn = require('child_process').spawn;

/**
* @module file
*/

/**
* Static file module.
* @param {Object} config
*/
module.exports = function (config) {
	module.exports.init(config);
};

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
	var _rmdirRecursive = function(path) {
		var error = '';
		if(fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function(file,index){
				var curPath = path + '/' + file;
				if(fs.lstatSync(curPath).isDirectory()) _rmdirRecursive(curPath);
				else fs.unlinkSync(curPath);
			});
			return fs.rmdirSync(path);
		}
		return error;
	};
	var _rmdirEmptyRecursive = function(path) {
		var error = '';
		if(fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function(file,index){
				var curPath = path + '/' + file;
				if(fs.lstatSync(curPath).isDirectory()) _rmdirEmptyRecursive(curPath);
				if(file === '.DS_Store') fs.unlinkSync(curPath);
				try {
					return fs.rmdirSync(curPath);
				} catch(e){}
			});
		}
		return error;
	};
	var _readdirRecursive = function(path) {
	    var results = []
	    var list = fs.readdirSync(path)
	    list.forEach(function(file) {
	        file = path + '/' + file
	        var stat = fs.statSync(file)
	        if (stat && stat.isDirectory()) results = results.concat(_readdirRecursive(file))
	        else results.push(file)
	    })
	    return results
	};

	var _fileInfo = function(srcPath){
		return fs.statSync(srcPath);
	};

	var _init = function(fileConfig){
		config = fileConfig;

        if(!fs.existsSync(config.staticsPath))
            _mkdirRecursive(config.staticsPath);
	};
	_init(config);

	var _readDir = function(srcPath, callback){
		callback(null, _readdirRecursive(srcPath).map(function(itm){
				return itm.replace(srcPath + '/','');
		}).filter(function(itm){ return itm.indexOf('.DS_Store') === -1; }));
	};
	var _moveFile = function(srcPath, destPath, callback){
		fs.rename(srcPath, destPath, callback);
	};
	var _writeFile = function(srcPath, data, callback){
		_mkdirRecursive(path.dirname(srcPath));
		fs.writeFile(srcPath, data, callback);
	};
	var _readFile = function(srcPath, callback){
		fs.readFile(srcPath, callback);
	};
	var _delFile = function(srcPath, callback){
		fs.unlink(srcPath, callback);
	};
	var _delDirectory = function(srcPath, callback){
		callback(null,_rmdirRecursive(srcPath));
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
	var _zipDirectory = function(srcPath, dstPath, callback){
		fstream
			.Reader({ 'path': srcPath, 'type': 'Directory' })
			.pipe(tar.Pack())
			.pipe(zlib.Gzip())
			.pipe(fstream.Writer({ 'path': dstPath }).on('close', function(){callback(null,dstPath)}));
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
		/**
		* List files.
		* @memberOf module:file#
		* @method list
		* @param {callback} callback
		*/
		list: _list,
		/**
		* Read a file in static config path.
		* @memberOf module:file#
		* @method read
		* @param {String} name - File name.
		* @param {callback} callback - Done handler.
		*/
		read: _read,
		/**
		* Write a file in static config path.
		* @memberOf module:file#
		* @method write
		* @param {String} name - File name.
		* @param {Object} data - File content.
		* @param {callback} callback - Done handler.
		*/
		write: _write,
		/**
		* Delete a file in static config path.
		* @memberOf module:file#
		* @method del
		* @param {String} name - File name.
		* @param {callback} callback - Done handler.
		*/
		del: _del,
		/**
		* Read the content of a directory in static config path.
		* @memberOf module:file#
		* @method readDir
		* @param {String} srcPath - Full source path.
		* @param {callback} callback - Done handler.
		*/
		readDir: _readDir,
		/**
		* Read file information (sync).
		* @memberOf module:file#
		* @method fileInfo
		* @param {String} srcPath - Full source path.
		*/
		fileInfo: _fileInfo,
		/**
		* Move file from source to destination.
		* @memberOf module:file#
		* @method moveFile
		* @param {String} srcPath - Full source path.
		* @param {String} dstPath - Full destination path.
		* @param {callback} callback - Done handler.
		*/
		moveFile: _moveFile,
		/**
		* Write a file.
		* @memberOf module:file#
		* @method writeFile
		* @param {String} name - File name as full source path.
		* @param {Object} data - File content.
		* @param {callback} callback - Done handler.
		*/
		writeFile: _writeFile,
		/**
		* Read a file.
		* @memberOf module:file#
		* @method writeFile
		* @param {String} name - File name as full source path.
		* @param {callback} callback - Done handler.
		*/
		readFile: _readFile,
		/**
		* Delete a file.
		* @memberOf module:file#
		* @method delFile
		* @param {String} name - File name as full source path.
		* @param {callback} callback - Done handler.
		*/
		delFile: _delFile,
		/**
		* Delete a directory recursive.
		* @memberOf module:file#
		* @method delDirectory
		* @param {String} name - Directory as full source path.
		* @param {callback} callback - Done handler.
		*/
		delDirectory:_delDirectory,
		/**
		* Get the directory disk usage.
		* @memberOf module:file#
		* @method dirStatistics
		* @param {String} name - Directory as full source path.
		* @param {callback} callback - Done handler.
		*/
		dirStatistics: _dirStatistics,
		/**
		* Zip a directory.
		* @memberOf module:file#
		* @method zipDirectory
		* @param {String} srcPath - Full source path.
		* @param {String} dstPath - Zip file name in full destination path.
		* @param {callback} callback - Done handler.
		*/
		zipDirectory:_zipDirectory,
		/**
		* Delete all empty directories.
		* @memberOf module:file#
		* @method cleanDirectories
		* @param {String} path - Full source path.
		*/
		cleanDirectories: _rmdirEmptyRecursive
	};
};