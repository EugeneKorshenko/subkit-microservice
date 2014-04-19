var fs = require("fs"),
	path = require("path"),
	CronJob = require('cron').CronJob,
	CronTime = require('cron').CronTime;

module.exports.init = function(conf,storage,pubsub,notify,es,email){
	if(!conf) throw new Error("no conf");
	var config = conf,
		tasks = require("./tasks"),
		rights;
	var _generateKey = function(){ 
		return Date.now() + '!' + Math.random().toString(16).slice(2);
	};
	
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

	//scheduler
	var _jobs = {};

	var _Eval = function(exec){
		exec.onTick = function(){
			var execFn = null,
				doneFn = null;
			if(exec.func) execFn = eval("(" + exec.func + ")");
			if(exec.done) doneFn = eval("(" + exec.done + ")");
			eval(execFn)(exec.payload, doneFn);
			if(!this.running) this.stop();
		};
		return new CronJob(job);
	};
	var _Task = function(task){
		task.onTick = function(){
			var self = this;
			_runTask(task.taskName, task.payload, function(err, data){
				if(!self.running) self.stop();
			});
		};
		return new CronJob(task);
	};
	var _Job = function(job){
		job.onTick = function(){
			var self = this;
			_runJob(job.jobName, job.payload, function(err, data){
				if(!self.running) self.stop();
			});
		};
		return new CronJob(job);
	};

	var Job = function(time, payload, fn, done){
		return {
			cronTime: time,
			payload: payload,
			func: fn.toString(),
			done: done.toString()
		}
	};
	var Task = function(time, payload, taskName){
		return {
			cronTime: time,
			payload: payload,
			taskName: taskName
		}
	};
	var _schedule = function(job, jobId){
		var cronJob = null;
		if(!jobId) jobId = _generateKey();

		try{
			new CronTime(job.cronTime);
		}catch(e){
			job.cronTime = new Date(job.cronTime);
		}
		job.onComplete = function(){
			storage.read("jobs", {key: jobId}, function(err, data){
				data.completed = true;
				storage.update("jobs", jobId, data, function(err, data){});
			});
		};

		if(job.taskName) {
			cronJob = new _Task(job);
		} else if(job.jobName){
			cronJob = new _Job(job);
		} else {
			cronJob = new _Eval(job);
		}
		
		cronJob.jobId = jobId;
		cronJob.start();
		return cronJob;
	};
	var _add = function(job){
		var key = _generateKey();
		storage.create("jobs", key, job, function(err, data){
			_schedule(job, key);
		});
	};
	var _remove = function(key){
		var job = _jobs[key];
		if(job){
			job.stop();
			delete _jobs[key];
		}
	};
	var _scheduleTasks = function(callback){
		storage.read("jobs", {}, function(err, data){
			data.forEach(function(job){
				if(!job.completed) 
					_jobs[job.key] = _schedule(job.value, job.key);
			});
		});
	};
	var _start = function(key){
		var job = _jobs[key];
		if(job) job.start();		
	};
	var _stop = function(key){
		var job = _jobs[key];
		if(job) job.stop();
	};
	var _list = function(){
		var result = [];
		for(var key in _jobs){
			result.push(key);
		}
		return result;
	};

	//tasks
	function _runTask(resource, params, callback){
		taskRunner.context.params = params;
		taskRunner.context.onData(callback);
		taskRunner.onScriptError(callback);
		taskRunner.run(resource);
		if(global.gc) global.gc();
	};
	function _execTask(resource, params, callback){
		taskRunner.context.params = params;
		taskRunner.context.onData(callback);
		taskRunner.onScriptError(callback);
		var env = taskRunner.build();
		env.load(resource);
		return env.exec();
	};
	var taskRunner = tasks.init({
		tasksPath : config.pluginsPath,
		context : {
			store: {
				read: storage.read,
				del: storage.del,
				create: storage.create,
				update: storage.update
			},
			email: {
				send: email ? email.send : function(){}
			},
			notify: {
				sendAPN: notify.sendAPN
			},
			pubsub: {
				publish: pubsub.publish
			},
			eventsource: {
				state: es.getState,
				projection: es.runAdHoc,
				live: es.runLive
			},
			hooks: config.hooks
		}
	});

	//jobs
	function _runJob(resource, params, callback){
		jobRunner.context.params = params;
		jobRunner.context.onData(callback);
		jobRunner.onScriptError(callback);
		jobRunner.run(resource);
		if(global.gc) global.gc();
	};
	function _execJob(resource, params, callback){
		jobRunner.context.params = params;
		jobRunner.context.onData(callback);
		jobRunner.onScriptError(callback);
		var env = jobRunner.build();
		env.load(resource);
		return env.exec();
	};
	var jobRunner = tasks.init({
		tasksPath : config.jobsPath,
		context : {
			store: {
				read: storage.read,
				del: storage.del,
				create: storage.create,
				update: storage.update
			},
			email: {
				send: email ? email.send : function(){}
			},
			notify: {
				sendAPN: notify.sendAPN
			},
			pubsub: {
				publish: pubsub.publish
			},
			eventsource: {
				state: es.getState,
				projection: es.runAdHoc,
				live: es.runLive
			},
			hooks: config.hooks
		}
	});

	//mapreduce
	var mrRunner = tasks.init({
		tasksPath : config.mapreducePath,
		context : {
			store: {
				read: storage.read,
				del: storage.del,
				create: storage.create,
				update: storage.update
			},
			email: {
				send: email ? email.send : function(){}
			},
			notify: {
				sendAPN: notify.sendAPN
			},
			pubsub: {
				publish: pubsub.publish
			},
			eventsource: {
				state: es.getState,
				projection: es.runAdHoc,
				live: es.runLive
			},
			hooks: config.hooks
		}
	});
	function _runMR(resource, params, callback){
		mrRunner.context.params = params;
		mrRunner.context.onData(callback);
		mrRunner.onScriptError(callback);
		mrRunner.run(resource);
		if(global.gc) global.gc();
	};
	var _scheduleMapReduce = function(){
		fs.readdir(config.mapreducePath, function(error, files){
			if(error || !files) return;

			files.forEach(function(file){
				if(file.indexOf('.js') === -1) return;
				file = file.replace(".js", "");
				_runMR(file, { key: file }, function(err, data){
					console.log("error");
					console.log(err);
					console.log("dat");
					console.log(data);
				});
			});
		});
	};

	return {
		getRights: function(){ return rights; },
		setPublic: setPublic,
		setPrivate: setPrivate,
		scheduler: {
			list: _list,
			scheduleTasks: _scheduleTasks,
			scheduleMapReduce: _scheduleMapReduce,
			schedule: _schedule,
			newTask: Task,
			newJob: Job,
			add: _add,
			remove: _remove,
			start: _start,
			stop: _stop,
		},
		runTask: _runTask,
		runJob: _runJob
	};
};