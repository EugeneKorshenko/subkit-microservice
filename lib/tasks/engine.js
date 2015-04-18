'use strict';

var vm = require('vm');
var fs = require('fs');

module.exports.init = function(sandbox, logger){

	return {
		execScript: function(path){ 
			return executeScript(path, sandbox || {});
		}
	};

	function executeScript(path, sandbox){
		var code = '';

		try{
			code = fs.readFileSync(path);
		}catch(error){			
			logger.log('task',{
				type: 'task',
				error: error,
				status: 'error',
				message: 'Script not found'
			});
			sandbox.task.done(error);
			return;
		}

		
		try{
			
			var script = vm.createScript(code);
			var context = vm.createContext(sandbox);

		 	script.runInContext(context);
		 	
		}catch(error){
			logger.log('task',{
				type: 'task',
				error: error,
				status: 'error',
				message: 'Task execution error'
			});			
			sandbox.task.done(error);
			return;
		}
	};
};

