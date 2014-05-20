var path = require('path'),
	engine = require('./engine'),
	context = require('./context');

module.exports.init = function(config){
	if(!config) throw new Error('No config defined.');

	var ctx = context.init(config.context || {});
	var wf = engine.init(ctx);
	return {
		context: ctx,
		onScriptError: wf.onScriptError,
		build: function(){
			var env = wf.build();
			return {
				load: function(resource){
					var filePath = path.join(config.tasksPath, resource + '.js');
					env.load(filePath);
				},
				exec: function(){
					return env.exec();
				}
			}
		},
		run: function(resource){
			ctx.resource = resource;
			var filePath = path.join(config.tasksPath, resource + '.js');
			return wf.execScript(filePath);
		}
	};
}