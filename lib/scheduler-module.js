var CronJob = require('cron').CronJob,
	CronTime = require('cron').CronTime;


// var newJob = new Job(new Date(Date.now() + 7000), {hello: "world"}, function (payload, done){
// 	console.log("working end");
// 	console.log(payload);
// 	setTimeout(done, 2000);
// }, function(){
// 	console.log("done");
// });


module.exports.init = function(storage){
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

	var _run = function(job, jobId){
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
			_run(job, job);
		});
	};

	var _remove = function(key){
		var job = _jobs[key];
		if(job){
			job.stop();
			delete _jobs[key];
		}
	};

	var _runAll = function(callback){
		storage.read("jobs", {}, function(err, data){
			data.forEach(function(job){
				if(!job.completed) 
					_jobs[job.key] = _run(job.value, job.key);
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

	return {
		list: _list,
		run: _runAll,
		newJob: Job,
		add: _add,
		remove: _remove,
		start: _start,
		stop: _stop,
	}
}