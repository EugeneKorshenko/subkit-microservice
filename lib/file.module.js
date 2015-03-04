'use strict';

var fs 		= require('fs');
var	path 	= require('path');
var	fstream = require('fstream');
var	tar 	= require('tar');
var	spawn 	= require('child_process').spawn;

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
	
	init(config);
	
	return {
		init: init,
		/**
		* List files.
		* @memberOf module:file#
		* @method list
		* @param {callback} callback
		*/
		list: list,
		/**
		* Read a file in static config path.
		* @memberOf module:file#
		* @method read
		* @param {String} name - File name.
		* @param {callback} callback - Done handler.
		*/
		read: read,
		/**
		* Write a file in static config path.
		* @memberOf module:file#
		* @method write
		* @param {String} name - File name.
		* @param {Object} data - File content.
		* @param {callback} callback - Done handler.
		*/
		write: write,
		/**
		* Delete a file in static config path.
		* @memberOf module:file#
		* @method del
		* @param {String} name - File name.
		* @param {callback} callback - Done handler.
		*/
		del: del,
		/**
		* Read the content of a directory in static config path.
		* @memberOf module:file#
		* @method readDir
		* @param {String} srcPath - Full source path.
		* @param {callback} callback - Done handler.
		*/
		readDir: readDir,
		/**
		* Read file information (sync).
		* @memberOf module:file#
		* @method fileInfo
		* @param {String} srcPath - Full source path.
		*/
		fileInfo: fileInfo,
		/**
		* Move file from source to destination.
		* @memberOf module:file#
		* @method moveFile
		* @param {String} srcPath - Full source path.
		* @param {String} dstPath - Full destination path.
		* @param {callback} callback - Done handler.
		*/
		moveFile: moveFile,
		/**
		* Write a file.
		* @memberOf module:file#
		* @method writeFile
		* @param {String} name - File name as full source path.
		* @param {Object} data - File content.
		* @param {callback} callback - Done handler.
		*/
		writeFile: writeFile,
		/**
		* Read a file.
		* @memberOf module:file#
		* @method writeFile
		* @param {String} name - File name as full source path.
		* @param {callback} callback - Done handler.
		*/
		readFile: readFile,
		/**
		* Delete a file.
		* @memberOf module:file#
		* @method delFile
		* @param {String} name - File name as full source path.
		* @param {callback} callback - Done handler.
		*/
		delFile: delFile,
		/**
		* Delete a directory recursive.
		* @memberOf module:file#
		* @method delDirectory
		* @param {String} name - Directory as full source path.
		* @param {callback} callback - Done handler.
		*/
		delDirectory: delDirectory,
		/**
		* Get the directory disk usage.
		* @memberOf module:file#
		* @method dirStatistics
		* @param {String} name - Directory as full source path.
		* @param {callback} callback - Done handler.
		*/
		dirStatistics: dirStatistics,
		/**
		* Tar a directory.
		* @memberOf module:file#
		* @method tarDirectory
		* @param {String} srcPath - Full source path.
		* @param {String} dstPath - Tar file name in full destination path.
		* @param {callback} callback - Done handler.
		*/
		tarDirectory: tarDirectory,
		/**
		* Extract a Tar file.
		* @memberOf module:file#
		* @method extractTar
		* @param {String} srcFile - Full path to Tar file.
		* @param {String} dstPath - Full extract destination path.
		* @param {callback} callback - Done handler.
		*/
		extractTar: extractTar,		
		/**
		* Delete all empty directories.
		* @memberOf module:file#
		* @method cleanDirectories
		* @param {String} path - Full source path.
		*/
		cleanDirectories: rmdirEmptyRecursive
	};
	
	function init(fileConfig){
		config = fileConfig;

        if(!fs.existsSync(config.staticsPath))
            mkdirRecursive(config.staticsPath);
	}
	function readDir(srcPath, callback){
		callback(null, readdirRecursive(srcPath).map(function(itm){
				return itm.replace(srcPath + '/','');
		}).filter(function(itm){ return itm.indexOf('.DS_Store') === -1; }));
	}
	function moveFile(srcPath, destPath, callback){
		fs.rename(srcPath, destPath, callback);
	}
	function writeFile(srcPath, data, callback){
		mkdirRecursive(path.dirname(srcPath));
		fs.writeFile(srcPath, data, callback);
	}
	function readFile(srcPath, callback){
		fs.readFile(srcPath, callback);
	}
	function delFile(srcPath, callback){
		fs.unlink(srcPath, callback);
	}
	function delDirectory(srcPath, callback){
		callback(null, rmdirRecursive(srcPath));
	}
	function dirStatistics(srcPath, callback){
		var sizeProcess = spawn('du', ['-sk', srcPath]);

		sizeProcess.stdout.on('data', function (data) {
			var size = data.toString().replace(/[a-zA-Z\/_.]/g,'').replace(/^\s+|\s+$/g, '');
			callback(null, Math.floor(size));
		});

		sizeProcess.stderr.on('data', function (err) {
			callback(err);
		});
	}
	function tarDirectory(srcPath, dstPath, callback){
		fstream
			.Reader({ 'path': srcPath, 'type': 'Directory' })
			.pipe(tar.Pack())
			.pipe(fstream.Writer({ 'path': dstPath }).on('close', function(){callback(null,dstPath);}));
	}
	function extractTar(srcFile, dstPath, callback){
		var errors;

		fs.createReadStream(srcFile)
			.pipe(tar.Extract({
			  path: dstPath,
			  strip: 1,
			}))
			.on('error', function(error){
				errors = error;
			})
			.on('close', function(){
				callback(errors);
			});		
	}

	function list(callback){
		readDir(config.staticsPath, callback);
	}
	function read(name, callback){
		var fullPath = path.join(config.staticsPath, name);
		readFile(fullPath, function(err, data){
			callback(err, data.toString());
		});
	}
	function write(name, data, callback){
		var fullPath = path.join(config.staticsPath, name);
		writeFile(fullPath, data, callback);
	}
	function del(name, callback){
		var fullPath = path.join(config.staticsPath, name);
		delFile(fullPath, callback);
	}
	function fileInfo(srcPath){
		return fs.statSync(srcPath);
	}

	function mkdirRecursive(dirPath, mode) {
        try{
            fs.mkdirSync(dirPath, mode);
        }catch(e){
            if(e && e.errno === 34){
                mkdirRecursive(path.dirname(dirPath), mode);
                mkdirRecursive(dirPath, mode);
            }
        }
    }
	function rmdirRecursive(path) {
		var error = '';
		if(fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function(file){
				var curPath = path + '/' + file;
				if(fs.lstatSync(curPath).isDirectory())  rmdirRecursive(curPath);
				else fs.unlinkSync(curPath);
			});
			return fs.rmdirSync(path);
		}
		return error;
	}
	function rmdirEmptyRecursive(path) {
		var error = '';
		if(fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function(file){
				var curPath = path + '/' + file;
				if(fs.lstatSync(curPath).isDirectory()) rmdirEmptyRecursive(curPath);
				if(file === '.DS_Store') fs.unlinkSync(curPath);
				try {
					return fs.rmdirSync(curPath);
				} catch(e){}
			});
		}
		return error;
	}
	function readdirRecursive(path) {
	    var results = [];
	    var list = fs.readdirSync(path);
	    list.forEach(function(file) {
	        file = path + '/' + file;
	        var stat = fs.statSync(file);
	        if (stat && stat.isDirectory()) results = results.concat(readdirRecursive(file));
	        else results.push(file);
	    });
	    return results;
	}

};
