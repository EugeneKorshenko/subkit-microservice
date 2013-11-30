var fs = require("fs"),
	path = require("path"),
	CronJob = require('cron').CronJob,
	CronTime = require('cron').CronTime;

module.exports.init = function(conf, storage, pubsub, email){
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

	//scheduler
	var _jobs = {};

	var _Job = function(job){
		job.onTick = function(){
			var jobFn = null,
				doneFn = null;
			if(job.func) jobFn = eval("(" + job.func + ")");
			if(job.done) doneFn = eval("(" + job.done + ")");
			eval(jobFn)(job.payload, doneFn);
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
		}
		else {
			cronJob = new _Job(job);
		}
		
		cronJob.jobId = jobId;
		cronJob.start();
		return cronJob;
	};
	var _add = function(job){
		var key = Date.now() + '!' + Math.random().toString(16).slice(2);
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
	var _scheduleAll = function(callback){
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
		return taskRunner.run(resource);
	};
	function _execTask(resource, params, callback){
		taskRunner.context.params = params;
		taskRunner.context.onData(callback);
		taskRunner.onScriptError(callback);
		var env = taskRunner.build();
		env.load(resource);
		return env.exec;
	};
	var taskRunner = tasks.init({
		tasksPath : config.tasksPath,
		context : {
			store: {
				read: storage.read,
				del: storage.del,
				create: storage.create,
				update: storage.update
			},
			email: {
				send: email.send
			},
			hooks: config.hooks
		}
	});

	//jobs
	function _runJob(resource, params, callback){
		jobRunner.context.params = params;
		jobRunner.context.onData(callback);
		jobRunner.onScriptError(callback);
		return jobRunner.run(resource);
	};
	function _execJob(resource, params, callback){
		jobRunner.context.params = params;
		jobRunner.context.onData(callback);
		jobRunner.onScriptError(callback);
		var env = jobRunner.build();
		env.load(resource);
		return env.exec;
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
				send: email.send
			},
			hooks: config.hooks
		}
	});

	return {
		getRights: function(){ return rights; },
		setPublic: setPublic,
		setPrivate: setPrivate,
		scheduler: {
			list: _list,
			schedule: _scheduleAll,
			newTask: Task,
			newJob: Job,
			add: _add,
			remove: _remove,
			start: _start,
			stop: _stop,
		},
		runTask: _runTask,
		execTask: _execTask,
		runJob: _runJob,
		execJob: _execJob
	};
}