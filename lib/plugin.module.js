'use strict';

var utils = require('./helper.js').init();
module.exports.init = function(pluginContext){

	var _loadAll = function(){
		for(var pluginName in pluginContext.AvailablePlugins){
			_load(pluginName, pluginContext.AvailablePlugins[pluginName]);
		}
	};
	var _load = function(pluginName, pluginVersion){
		pluginVersion = (pluginVersion === '*') ? '*': 'V' + pluginVersion
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
		var result = [];
		for(var name in pluginContext.AvailablePlugins){
			result.push(name);
		}
		callback(null, result);
	};
	//TODO: expand plugin api with cleanup and configure function
	var _unload = function(pluginName){
		for(var idx in require.cache){
			if(idx.indexOf(pluginName) !== -1){
				delete require.cache[idx];
				// var name = require.resolve(idx);
				// delete require.cache[name];
			}
		}
		utils.log('plugin', 'Plugin ' + pluginName + ' unloaded.');
	};

	return {
		load: _load,
		loadAll: _loadAll,
		unload: _unload,
		list: _list
	};
};