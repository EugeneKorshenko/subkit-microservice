var path = require('path'),
	engine = require('./engine'),
	context = require('./context');

module.exports.init = function(config, logger){
	if(!config) throw new Error('No config defined.');

	var ctx = context.init(config.context || {}, logger);
	var wf = engine.init(ctx, logger);
	return {
		context: ctx,
		onScriptError: wf.onScriptError,
		run: function(resource){
			ctx.resource = resource;
			var filePath = path.join(config.tasksPath, resource, 'task.js');
			return wf.execScript(filePath);
		}
	};
}