'use strict';

var crypto = require('crypto'),
	fs = require('fs'),
	path = require('path'),
	_ = require('underscore');

module.exports.init = function(admin, api, etag, storage){
	var _apiAuth = function(req, res, next){
		var resource = req.params[0] || req.params.channel || req.getPath(),
			api_key = req.headers['x-auth-token'] || req.params.apiKey || req.params.api_Key || req.headers.apikey || req.headers.api_key,
			isReadMethod = (req.method === 'GET' || req.method === 'HEAD') ? true : false;

		var isPublic = _.contains(storage.getRights().public, resource);
		if(!isPublic && (api_key !== api.apiKey)) return res.send(401);
		return next();
	};
	var _userAuth = function(req, res, next){
		if(req.username === 'anonymous' || req.username !== admin.username || req.authorization.basic.password !== admin.password)
			return res.send(401);
		return next();		
	};
	var _setNewETag = function(req, res, next){
		var now = new Date().toString();
		var md5 = crypto.createHash('md5');
		if(etag){
			etag.etag = md5.update(now).digest('hex');
			etag.lastModified = now;
		}
		if(next) return next();
	};
	var _generateKey = function(){ 
		return Date.now() + '!' + Math.random().toString(16).slice(2);
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

	return {
		apiAuth: _apiAuth,
		userAuth: _userAuth,
		setNewETag: _setNewETag,
		generateKey: _generateKey,
		rmdirRecursive:_rmdirRecursive,
		mkdirRecursive:_mkdirRecursive
	};
};

