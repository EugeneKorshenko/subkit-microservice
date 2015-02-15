'use strict';

var utils = require('./utils.module.js').init();
var shelljs = require('shelljs');
var _ = require('underscore');

module.exports.init = function(pluginContext){

	return {
		load: load,
		loadAll: loadAll,
		list: list,
		npmAdd: npmAdd,
		npmUpdate: npmUpdate,
		fileAdd: fileAdd,
		fileUpdate: fileUpdate,
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

		if(pluginContext.plugins && pluginContext.plugins.length > 0) {

			for(var idx in pluginContext.plugins){
				results.push({
					name: pluginContext.plugins[idx].name,
					version: pluginContext.plugins[idx].version
				});
			}
			results = _.uniq(results, function(item) { 
				return item.name;
			});
		}
		

		pluginContext.plugins = results;
		callback(null, {results: results});
	}
	function npmAdd(pluginName, callback){
		shelljs.exec('npm install ' + pluginName +' --save-optional',{silent:false, async:true}, callback);
	}
	function npmUpdate(pluginName, callback){
		shelljs.exec('npm update ' + pluginName +' --save-optional',{silent:true, async:true}, callback);	
	}
	function fileAdd(pluginFilePath, callback){
		shelljs.exec('npm install ' + pluginFilePath +' --save-optional',{silent:false, async:true}, callback);
	}
	function fileUpdate(pluginFilePath, callback){
		shelljs.exec('npm update ' + pluginFilePath +' --save-optional', {silent:true, async:true}, callback);	
	}
	function remove(pluginName, callback){
		shelljs.exec('npm remove ' + pluginName +' --save-optional',{silent:true, async:true}, callback);
		pluginContext.plugins = pluginContext.plugins.filter(function(itm){
			return itm.name !== pluginName;
		});
	}	

};