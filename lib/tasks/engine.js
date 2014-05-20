var vm = require('vm'),
	fs = require('fs');

module.exports.init = function(sandbox){
	var ctx = sandbox || {};
	var onError;

	var exec = function(code, sandbox){
		try{
			var script = vm.createScript(code),
				context = vm.createContext(sandbox);
		 	script.runInContext(context);
		}catch(error){
			error.stack = error.stack.split('\n')
							.reduce(function(previousValue, currentValue, index, array){
								if(index > 1) return previousValue;
								previousValue += currentValue + '\n';
								return previousValue;
							},'');
			onError(error);
		}
		return context;
	};

	var executeScript = function(path, sandbox){
		var code = '';
		try{
			if(fs.existsSync(path)) code = fs.readFileSync(path);
			else onError(new Error('Script not found.'));
		}catch(error){
			onError(new Error('Script not found.'));
		}
		return exec(code, sandbox);
	};

	return {
		build: function(){
			var script;
			var context = vm.createContext(ctx);
			return {
				load: function(path){
					var code;
					try{
						if(fs.existsSync(path)) code = fs.readFileSync(path);
						else return onError(new Error('Script not found.'));
					}catch(error){
						onError(new Error('Script not found.'));
					}
					try{
						script = vm.createScript(code);
					}catch(error){
						onError(error);
					}
				},
				exec: function(){
					try{
						script.runInContext(context);
						return context;
					}catch(error){
						onError(error);
					}
				}
			};
		},
		onScriptError: function(callback){ onError = callback; },
		execScript: function(path){ return executeScript(path, ctx); }
	};
};

