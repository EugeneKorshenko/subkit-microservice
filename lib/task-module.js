var fs = require("fs"),
	path = require("path"),
	CronJob = require('cron').CronJob,
	CronTime = require('cron').CronTime;

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

	var Job = function(time, payload, fn, done){
		return {
			cronTime: time,
			payload: payload,
			func: fn.toString(),
			done: done.toString()
		}
	}

	var _schedule = function(job, jobId){
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
		var cronJob = new _Job(job);
		cronJob.jobId = jobId;
		cronJob.start();
		return cronJob;
	};

	var _add = function(job){
		var key = Date.now() + '!' + Math.random().toString(16).slice(2);
		storage.create("jobs", key, job, function(err, data){
			_schedule(job, job);
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
		scheduler: {
			list: _list,
			schedule: _scheduleAll,
			newJob: Job,
			add: _add,
			remove: _remove,
			start: _start,
			stop: _stop,
		},
		run: _run,
		task: _task
	};
}