'use strict';

module.exports.init = function(pluginContext){

	var _loadAll = function(){
		for(var pluginName in pluginContext.AvailablePlugins){
			_load(pluginName);
		}
	};
	var _load = function(pluginName){
		console.log('Loading plugin: ' + pluginName);
		try {
			require(pluginName).init(pluginContext);
		}
		catch(e){
			console.log('Plugin: ' + pluginName + ' could not be loaded.');
			console.log(e);
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
			}
		}
		console.log('Plugin ' + pluginName + ' unloaded.');
	};

	return {
		load: _load,
		loadAll: _loadAll,
		unload: _unload,
		list: _list
	};
};