'use strict';

var utils = require('./utils.module.js').init();
var shelljs = require('shelljs');

module.exports.init = function(pluginContext){

	return {
		load: load,
		loadAll: loadAll,
		list: list,
		add: add,
		update: update,
		remove: remove
	};

	function loadAll(){
		for(var pluginName in pluginContext.plugins){
			load(pluginName, pluginContext.plugins[pluginName]);
		}
	}
	function load(pluginName, pluginVersion){
		pluginVersion = (pluginVersion === '*') ? '*': 'V' + pluginVersion;
		try {
			require(pluginName).init(pluginContext);
			utils.log('Plugin: ' + pluginName + ' (' + pluginVersion + ') loaded.');
		}
		catch(e){
			utils.trace(new Error('Plugin Error: ' + pluginName + ' (' + pluginVersion + ') could not be loaded.'));
			utils.trace(e);
		}
	}
	function list(callback){
		delete require.cache[require.resolve('../package.json')];
		var subkitPackage = require('../package.json');
		var results = [];
		for(var name in subkitPackage.optionalDependencies){
			results.push({
				name: name,
				version: subkitPackage.optionalDependencies[name]
			});
		}
		pluginContext.plugins = results;
		callback(null, {results: results});
	}
	function add(pluginName, callback){
		shelljs.exec('npm install ' + pluginName +' --save-optional',{silent:false, async:true}, callback);
	}
	function remove(pluginName, callback){
		shelljs.exec('npm remove ' + pluginName +' --save-optional',{silent:true, async:true}, callback);
	}
	function update(pluginName, callback){
		shelljs.exec('npm update ' + pluginName +' --save-optional',{silent:true, async:true}, callback);	
	}

};