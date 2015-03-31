var vm = require('vm');
var fs = require('fs');
var utils = require('../utils.module.js').init();

module.exports.init = function(sandbox){
	var ctx = sandbox || {};
	var onError;

	var exec = function(code, sandbox){
		try{
			var script = vm.createScript(code);
			var context = vm.createContext(sandbox);

		 	script.runInContext(context);
		}catch(error){
			utils.log('task',{
				type: 'task',
				error: error,
				status: 'error',
				message: 'Task execution error'
			});
			error.stack = error
							.stack
							.split('\n')
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
			
			utils.log('task',{
				type: 'task',
				error: error,
				status: 'error',
				message: 'Script not found'
			});

			onError(new Error('Script not found.'));
		}
		return exec(code, sandbox);
	};

	return {
		onScriptError: function(callback){ onError = callback; },
		execScript: function(path){ return executeScript(path, ctx); }
	};
};

