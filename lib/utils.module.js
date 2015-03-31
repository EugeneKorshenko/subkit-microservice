'use strict';

var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

module.exports.init = function(){
	var saltLength = 9;

	return {
		generateKey: generateKey,
		rmdirRecursive: rmdirRecursive,
		mkdirRecursive: mkdirRecursive,
		hash: createHash,
		validate: validateHash,
		log: log
	};

	//utils
	function log(message, params){
		console.info(JSON.stringify({
			timestamp: new Date().toISOString(),
			message: message,
			params: params
		}));
	}
	function generateKey(){ 
		return Date.now() + '!' + Math.random().toString(16).slice(2);
	}
	//directory ops
	function rmdirRecursive(path) {
		var error = '';
		if(fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function(file){
				var curPath = path + '/' + file;
				if(fs.lstatSync(curPath).isDirectory()) rmdirRecursive(curPath);
				else fs.unlinkSync(curPath);
			});
			return fs.rmdirSync(path);
		}
		return error;
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
	//hashing
	function createHash(password) {
		var salt = generateSalt(saltLength);
		var hash = md5(password + salt);
		return salt + hash;
	}
	function validateHash(hash, password) {
		var salt = hash.substr(0, saltLength);
		var validHash = salt + md5(password + salt);
		return hash === validHash;
	}
	function generateSalt(len) {
		var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',
		    setLen = set.length,
		    salt = '';

		for (var i = 0; i < len; i++) {
		  var p = Math.floor(Math.random() * setLen);
		  salt += set[p];
		}
		return salt;
	}
	function md5(string) {
		return crypto.createHash('md5').update(string).digest('hex');
	}
};

