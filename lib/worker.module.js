'use strict';

var fs = require('fs'),
	CronJob = require('cron').CronJob,
	CronTime = require('cron').CronTime;

/**
* @module worker
*/
/**
 * Async result callback.
 * @callback callback
 * @param {Object} error
 * @param {Object} data
 */
/**
* Worker module.
* @param {Object} config - Configuration.
* @param {Object} store - Store module dependency.
* @param {Object} pubsub - PubSub module dependency.
* @param {Object} es - EventSource module dependency.
*/
module.exports = function (config, storage, pubsub, es) {
	module.exports.init(config, storage, pubsub, es);
};
module.exports.init = function(conf, storage, pubsub, es){
	if(!conf) throw new Error('No configuration found.');

	var self = this,
		config = conf,
		tasks = require('./tasks'),
		_jobs = {},
		taskRunner,
		jobRunner,
		mrRunner;

	var _generateKey = function(){ 
		return Date.now() + '!' + Math.random().toString(16).slice(2);
	};

	//scheduler
	var EvalInternal = function(exec){
		exec.onTick = function(){
			var execFn = null,
				doneFn = null;
			if(exec.func) execFn = eval('(' + exec.func + ')');
			if(exec.done) doneFn = eval('(' + exec.done + ')');
			eval(execFn)(exec.payload, doneFn);
			if(!this.running) this.stop();
		};
		return new CronJob(job);
	};
	var TaskInternal = function(task){
		task.onTick = function(){
			var self = this;
			_runTask(task.taskName, task.payload, function(err, data){
				if(!self.running) self.stop();
			});
		};
		return new CronJob(task);
	};
	var JobInternal = function(job){
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
		};
	};
	var Task = function(time, payload, taskName){
		return {
			cronTime: time,
			payload: payload,
			taskName: taskName
		};
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
			storage.read('jobs', {key: jobId}, function(err, data){
				data.completed = true;
				storage.update('jobs', jobId, data, function(err, data){});
			});
		};

		if(job.taskName) {
			cronJob = new TaskInternal(job);
		} else if(job.jobName){
			cronJob = new JobInternal(job);
		} else {
			cronJob = new EvalInternal(job);
		}
		
		cronJob.jobId = jobId;
		cronJob.start();
		return cronJob;
	};
	var _add = function(job){
		var key = _generateKey();
		storage.create('jobs', key, job, function(err, data){
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
		storage.read('jobs', {}, function(err, data){
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
	var _init = function(workerConfig){
		config = workerConfig;

		taskRunner = tasks.init({
			tasksPath : config.pluginsPath,
			context : {
				store: {
					read: storage.read,
					del: storage.del,
					create: storage.create,
					update: storage.update
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
		jobRunner = tasks.init({
			tasksPath : config.jobsPath,
			context : {
				store: {
					read: storage.read,
					del: storage.del,
					create: storage.create,
					update: storage.update
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
		mrRunner = tasks.init({
			tasksPath : config.mapreducePath,
			context : {
				store: {
					read: storage.read,
					del: storage.del,
					create: storage.create,
					update: storage.update
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
		return self;
	};

	//tasks
	var _runTask = function(resource, params, callback){
		taskRunner.context.params = params;
		taskRunner.context.onData(callback);
		taskRunner.onScriptError(callback);
		taskRunner.run(resource);
		if(global.gc) global.gc();
	};
	var _execTask = function(resource, params, callback){
		taskRunner.context.params = params;
		taskRunner.context.onData(callback);
		taskRunner.onScriptError(callback);
		var env = taskRunner.build();
		env.load(resource);
		return env.exec();
	};
	//jobs
	var _runJob = function(resource, params, callback){
		jobRunner.context.params = params;
		jobRunner.context.onData(callback);
		jobRunner.onScriptError(callback);
		jobRunner.run(resource);
		if(global.gc) global.gc();
	};
	var _execJob = function(resource, params, callback){
		jobRunner.context.params = params;
		jobRunner.context.onData(callback);
		jobRunner.onScriptError(callback);
		var env = jobRunner.build();
		env.load(resource);
		return env.exec();
	};
	//mapreduce
	var _runMR = function(resource, params, callback){
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
				file = file.replace('.js', '');
				_runMR(file, { key: file }, function(err, data){
					console.log('error');
					console.log(err);
					console.log('dat');
					console.log(data);
				});
			});
		});
	};

	_init(config);

	return {
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
		init: _init,
		/**
		* Get channels grouped by client key.
		* @memberOf module:worker#
		* @method runTask
		* @param {String} resource - Name of script.
		* @param {Object} params - Script parameters.
		* @param {callback} callback
		*/
		runTask: _runTask,
		/**
		* Get channels grouped by client key.
		* @memberOf module:worker#
		* @method runJob
		* @param {String} resource - Name of script.
		* @param {Object} params - Script parameters.
		* @param {callback} callback
		*/
		runJob: _runJob
	};
};