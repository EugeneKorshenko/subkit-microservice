var fs = require("fs"),
	path = require("path");

module.exports.init = function(conf, storage, pubsub){
	if(!conf) throw new Error("no conf");
	var config = conf,
		tasks = require("./tasks"),
		rights;

	//rights
	function writeRights(){
		fs.writeFileSync(config.rightsPath, JSON.stringify(rights, null, 4));
	}
	function readRights(){
		var data = fs.readFileSync(config.rightsPath);
		rights = JSON.parse(data);
	}
	function setPublic(name, callback){
		var match = rights.public.indexOf(name);

		if(match === -1){
			rights.public.push(name);
			writeRights();
			callback(null, {
				grant: true,
				name: name
			});
		}else{
			callback(new Error("store not found"));
		}
	}
	function setPrivate(name, callback){
		var match = rights.public.indexOf(name);

		if(match !== -1){
			rights.public.splice(match, 1);
			writeRights();
			callback(null, {
				grant: false,
				name: name
			});
		}else{
			callback(new Error("store not found"));
		}
	}

		//rights file refresh on change
	fs.watchFile(config.rightsPath, function (curr, prev) {
		console.log("rights file changed - reload.");
		readRights();
	});

	//init
	readRights();

	//tasks
	function _run(resource, params, callback){
		runner.context.params = params;
		runner.context.onData(callback);
		runner.onScriptError(callback);
		return runner.run(resource);
	}

	function _task(resource, params, callback){
		runner.context.params = params;
		runner.context.onData(callback);
		runner.onScriptError(callback);
		var env = runner.build();
		env.load(resource);
		return env.exec;
	}

	var runner = tasks.init({
		tasksPath : config.filesPath,
		context : {
			store: {
				read: storage.read,
				del: storage.del,
				create: storage.create,
				update: storage.update
			},
			hooks: config.hooks
		}
	});

	return {
		getRights: function(){ return rights; },
		setPublic: setPublic,
		setPrivate: setPrivate,
		run: _run,
		task: _task
	};
}