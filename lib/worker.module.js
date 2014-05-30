'use strict';

var fs = require('fs'),
	path = require('path'),
	uuid = require('node-uuid'),
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
		scheduledTasks = {},
		runner;

	var _rmdirRecursive = function(path) {
		var error = '';
		if(fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function(file,index){
				var curPath = path + '/' + file;
				if(fs.lstatSync(curPath).isDirectory()) _rmdirRecursive(curPath);
				else fs.unlinkSync(curPath);
			});
			return fs.rmdirSync(path);
		}
		return error;
	};
	var _mkdirRecursive = function(dirPath, mode) {
		try{
			fs.mkdirSync(dirPath, mode);
		}catch(e){
			if(e && e.errno === 34){
				_mkdirRecursive(path.dirname(dirPath), mode);
				_mkdirRecursive(dirPath, mode);
			}
		}
	};

	var _init = function(workerConfig){
		config = workerConfig;

		if(!fs.existsSync(config.tasksPath))
			_mkdirRecursive(config.tasksPath);

		runner = tasks.init({
			tasksPath : config.tasksPath,
			context : {
				store: {
					read: storage.read,
					del: storage.del,
					upsert: storage.upsert
				},
				pubsub: {
					publish: pubsub.publish,
					on: pubsub.on
				},
				eventsource: {
					state: es.getState,
					projection: es.runAdHoc,
					live: es.runLive
				}
			}
		});
		return self;
	};

	var _get = function(name, callback){
		var pathToTask = path.join(config.tasksPath, name);
		var taskExists = fs.existsSync(pathToTask);
		if(!taskExists) return callback(new Error('Not found.'));

		fs.readFile(path.join(pathToTask, 'definition.json'), function(error, data){
			if(!data) data = '{}';
			data = JSON.parse(data);
			data['TaskScript'] = fs.readFileSync(path.join(pathToTask, 'task.js'), 'utf8');
			callback(error, data);
		});
	};
	var _list = function(callback){
		fs.readdir(config.tasksPath, function(error, data){
			if(!data) data = [];
			callback(error, data.filter(function(item){
				var stats = fs.lstatSync(path.join(config.tasksPath, item))
				return stats.isDirectory();
			}).map(function(item){
				return {
					Name: item,
					Key: item
				}
			}));
		});
	};
	var _set = function(name, task, callback){
		var error = '';
		var pathToTask = path.join(config.tasksPath, name);
		var taskExists = fs.existsSync(pathToTask);
		if(!taskExists) error = fs.mkdirSync(pathToTask);
		error = fs.writeFileSync(path.join(pathToTask, 'definition.json'), JSON.stringify(task, null, 4));
		error = fs.writeFileSync(path.join(pathToTask, 'task.js'), task.TaskScript);
		_startSchedule(task, function(error, data){
			callback(error, { message: 'Created.'});	
		}, true);
	};
	var _remove = function(name, callback){
		_stopSchedule(name);
		var error = '';
		var pathToTask = path.join(config.tasksPath, name);
		error = _rmdirRecursive(pathToTask);
		callback(error, {message: 'Removed.'});
	};
	var _runScheduler = function(force, callback){
		if(!callback) callback = function(error, data){};

		_list(function(error, data){
			data.forEach(function(itm){
				_get(itm.Name, function(error, task){					
					_startSchedule(task, callback, force);
				});
			});
		});
	};
	var _startSchedule = function(task, callback, force){
		if(!task.Schedule && !task.isContinuous) return callback();

		if(scheduledTasks[task.Name] && !force) return callback();
		if(scheduledTasks[task.Name] && force) _stopSchedule(task.Name);
		
		if(task.Schedule){
			try { new CronJob(task.Schedule); }
			catch(ex) { if(callback) { return callback({message: task.Name + ': Invalid pattern.'});} else {return;} }

			console.log(task.Name + ': Cron task running by ' + task.Schedule);
			scheduledTasks[task.Name] = new CronJob(
				task.Schedule,
				function(){ 
					pubsub.publish('log!task',task.Name, {name: task.Name, stage:'scheduled', status:'start', timestamp: new Date().toString() });
					_run(task.Name, task.Parameters, function(){
						pubsub.publish('log!task',task.Name, {name: task.Name, stage:'scheduled', status:'end', timestamp: new Date().toString() });
						if (callback) callback(null, {
							message: task.Name + ': Task run done.',
							timestamp: new Date().toString() 
						});
					});
				},
				function(){},
				true);
		}

		if(task.isContinuous){
			console.log(task.Name + ': Continuous task running.');
			pubsub.publish('log!task',task.Name, {name: task.Name, stage:'continuous', status:'start', timestamp: new Date().toString() });
			
			//extend API for _stopSchedule
			task.stop = function(){
				//TODO: force task stop (circuit breaker)
			};
			scheduledTasks[task.Name] = task;

			_run(task.Name, task.Parameters, function(){
				pubsub.publish('log!task',task.Name, {name: task.Name, stage:'continuous', status:'end', timestamp: new Date().toString() }); 
				if (callback) callback(null, {
					message: task.Name + ': Task run done.',
					timestamp: new Date().toString() 
				});
			});
		}
	};
	var _stopSchedule = function(name){
		if(!scheduledTasks[name]) return;
		
 		scheduledTasks[name].stop();
 		delete scheduledTasks[name];
 		console.log(name + ': Task stopped.');
	};

	var _run = function(name, params, callback){
		var outLog = [];
		runner.context.params = params;
		runner.context.onData(function(error, data, contentType){
			pubsub.publish('log!task',name, {name: name, stage:'task', status:'done', timestamp: new Date().toString()});
			callback(error, data, contentType, outLog);
		}, function(text){
			outLog.push(text);
		});
		runner.onScriptError(function(error, data, contentType){
			pubsub.publish('log!task',name, {name: name, stage:'task', status:'error', message: error, timestamp: new Date().toString()});
			callback(error, data, contentType, outLog);
		});
		pubsub.publish('log!task',name, {name: name, stage:'task', status:'run', timestamp: new Date().toString()});
		runner.run(name);
		if(global.gc) global.gc();
	};

	_init(config);

	var Task = function(name, params){
		var self = this;
		self.Name = name;
		self.Description = '';
		self.Schedule = '';
		self.isContinuous = false;
		self.DateTime = '';
		self.TaskScript = 'done(null,{});';
		self.Parameters = params || {};
	};

	return {
		/**
		* (Re)init the worker modules.
		* @memberOf module:worker#
		* @method init
		* @param {Object} workerConfig - The worker configuration.
		*/
		init: _init,
		/**
		* Creates a new Task.
		* @memberOf module:worker#
		* @method Task
		* @param {String} name - Name of script.
		* @param {Object} params - Script parameters.
		*/
		Task: Task,
		/**
		* Run a task.
		* @memberOf module:worker#
		* @method run
		* @param {String} name - Name of script.
		* @param {Object} params - Script parameters.
		* @param {callback} callback
		*/
		run:_run,
		/**
		* Save a task.
		* @memberOf module:worker#
		* @method set
		* @param {String} name - Name of script.
		* @param {Object} task - A Task object.
		* @param {callback} callback
		*/
		set:_set,
		/**
		* Removes a task.
		* @memberOf module:worker#
		* @method remove
		* @param {String} name - Name of script.
		* @param {callback} callback
		*/
		remove:_remove,
		/**
		* Gets a task by name.
		* @memberOf module:worker#
		* @method get
		* @param {String} name - Name of script.
		* @param {callback} callback
		*/
		get:_get,
		/**
		* List tasks.
		* @memberOf module:worker#
		* @method list
		* @param {callback} callback
		*/
		list:_list,
		/**
		* Starts the scheduler.
		* @memberOf module:worker#
		* @method runScheduler
		* @param {callback} callback
		*/
		runScheduler:_runScheduler
	};
};