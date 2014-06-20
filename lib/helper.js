'use strict';

var crypto = require('crypto'),
	fs = require('fs'),
	path = require('path'),
	_ = require('underscore');

module.exports.init = function(){
	var _saltLength = 9;

	var _generateKey = function(){ 
		return Date.now() + '!' + Math.random().toString(16).slice(2);
	};
	
	//directory ops
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

	//hashing
	var _createHash = function(password) {
		var salt = _generateSalt(_saltLength);
		var hash = _md5(password + salt);
		return salt + hash;
	};
	var _validateHash = function(hash, password) {
		var salt = hash.substr(0, _saltLength);
		var validHash = salt + _md5(password + salt);
		return hash === validHash;
	};
	var _generateSalt = function(len) {
		var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',
		    setLen = set.length,
		    salt = '';

		for (var i = 0; i < len; i++) {
		  var p = Math.floor(Math.random() * setLen);
		  salt += set[p];
		}
		return salt;
	};
	var _md5 = function(string) {
		return crypto.createHash('md5').update(string).digest('hex');
	};

	return {
		generateKey: _generateKey,
		rmdirRecursive:_rmdirRecursive,
		mkdirRecursive:_mkdirRecursive,
		hash: _createHash,
		validate: _validateHash
	};
};

