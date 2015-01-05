'use strict';

var utils = require('./utils.module.js').init();
var shelljs = require('shelljs');

module.exports.init = function(pluginContext){

	var _loadAll = function(){
		for(var pluginName in pluginContext.plugins){
			_load(pluginName, pluginContext.plugins[pluginName]);
		}
	};
	var _load = function(pluginName, pluginVersion){
		pluginVersion = (pluginVersion === '*') ? '*': 'V' + pluginVersion;
		try {
			require(pluginName).init(pluginContext);
			utils.log('Plugin: ' + pluginName + ' (' + pluginVersion + ') loaded.');
		}
		catch(e){
			utils.trace(new Error('Plugin Error: ' + pluginName + ' (' + pluginVersion + ') could not be loaded.'));
			utils.trace(e);
		}
	};
	var _list = function(callback){
		delete require.cache[require.resolve('../package.json')];
		var subkitPackage = require('../package.json');
		var results = [];
		for(var name in subkitPackage.optionalDependencies){
			results.push(name);
		}
		pluginContext.plugins = results;
		callback(null, {results: results});
	};
	var _add = function(pluginName, callback){
		shelljs.exec('npm install ' + pluginName +' --save-optional',{silent:true, async:true}, callback);
	};
	var _remove = function(pluginName, callback){
		shelljs.exec('npm remove ' + pluginName +' --save-optional',{silent:true, async:true}, callback);
	};

	return {
		load: _load,
		loadAll: _loadAll,
		list: _list,
		add: _add,
		remove: _remove
	};
};