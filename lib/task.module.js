'use strict';

var fs = require('fs');
var	path = require('path');
var	CronJob = require('cron').CronJob;

/**
* @module Task
*/
/**
 * Async result callback.
 * @callback callback
 * @param {Object} error
 * @param {Object} data
 */
/**
* Task module.
* @param {Object} config - Configuration.
* @param {Object} store - Store module dependency.
* @param {Object} event - Event module dependency.
* @param {Object} es - EventSource module dependency.
*/
module.exports = function (config, storage, event, es, template, file, logger) {
	module.exports.init(config, storage, event, es, template, file, logger);
};
module.exports.init = function(conf, storage, event, es, template, file, logger){
	if(!conf) throw new Error('No configuration found.');

	var self = this;
	var config = conf;
	var tasks = require('./tasks');
	var scheduledTasks = {};
	var runner;

	init(config);

	return {
		/**
		* (Re)init the task modules.
		* @memberOf module:task#
		* @method init
		* @param {Object} taskConfig - The task configuration.
		*/
		init: init,
		/**
		* Creates a new Task.
		* @memberOf module:task#
		* @method Task
		* @param {String} name - Name of script.
		* @param {Object} params - Script parameters.
		*/
		Task: Task,
		/**
		* Run a task.
		* @memberOf module:task#
		* @method run
		* @param {String} name - Name of script.
		* @param {Object} params - Script parameters.
		* @param {callback} callback
		*/
		run:run,
		/**
		* Save a task.
		* @memberOf module:task#
		* @method set
		* @param {String} name - Name of script.
		* @param {Object} task - A Task object.
		* @param {callback} callback
		*/
		set:set,
		/**
		* Removes a task.
		* @memberOf module:task#
		* @method remove
		* @param {String} name - Name of script.
		* @param {callback} callback
		*/
		remove:remove,
		/**
		* Gets a task by name.
		* @memberOf module:task#
		* @method get
		* @param {String} name - Name of script.
		* @param {callback} callback
		*/
		get:get,
		/**
		* List tasks.
		* @memberOf module:task#
		* @method list
		* @param {callback} callback
		*/
		list:list,
		/**
		* Starts the scheduler.
		* @memberOf module:task#
		* @method runScheduler
		* @param {callback} callback
		*/
		runScheduler:runScheduler
	};

	function Task(name, params){
		var self = this;
		self.name = name;
		self.description = '';
		self.schedule = '';
		self.continuous = false;
		self.taskScript = 'task.done(null, {});';
		self.parameters = params || {};
	}
	function init(taskConfig){
		config = taskConfig;

		if(!fs.existsSync(config.tasksPath))
			_mkdirRecursive(config.tasksPath);

		runner = tasks.init({
			tasksPath : config.tasksPath,
			context : {
				store: {
					find: storage.query,
					remove: storage.del,
					add: storage.insert,
					update: storage.update,
					stores: storage.stores
				},
				event: {
					emit: event.emit,
					on: event.on,
					once: event.once
				},
				eventsource: {
					from: es.from
				},
				template:{
					render: template.render
				},
				file:{
					list: file.list,
					write: file.write,
					read: file.read,
					remove: file.del
				}
			}
		}, logger);

		return self;
	}
	function get(name, callback){
		var pathToTask = path.join(config.tasksPath, name);
		var taskExists = fs.existsSync(pathToTask);
		if(!taskExists) return callback(new Error('Task not found'));

		fs.readFile(path.join(pathToTask, 'definition.json'), function(error, data){
			if(!data) data = '{}';
			data = JSON.parse(data);
			data.taskScript = fs.readFileSync(path.join(pathToTask, 'task.js'), 'utf8');
			callback(error, data);
		});
	}
	function list(callback){
		fs.readdir(config.tasksPath, function(error, data){
			if(!data) data = [];
			callback(error, data.filter(function(item){
				var filePath = path.join(config.tasksPath, item);
				if((fs.existsSync(filePath)) || (fs.existsSync(path.join(__dirname, filePath)))) {
					var stats = fs.lstatSync(filePath);
					return stats.isDirectory();
				}
				return false;
			}).map(function(item){
				return {
					name: item,
					key: item
				};
			}));
		});
	}
	function set(name, task, callback){
		var error = '';
		var pathToTask = path.join(config.tasksPath, name);
		var taskExists = fs.existsSync(pathToTask);
		if(!taskExists) error = fs.mkdirSync(pathToTask);
		error = fs.writeFileSync(path.join(pathToTask, 'definition.json'), JSON.stringify(task, null, 4));
		error = fs.writeFileSync(path.join(pathToTask, 'task.js'), task.taskScript);
		startSchedule(task, function(error){
			callback(error, { message: 'created'});	
		}, true);
	}
	function remove(name, callback){
		stopSchedule(name);
		var error = '';
		var pathToTask = path.join(config.tasksPath, name);
		error = _rmdirRecursive(pathToTask);
		callback(error, {message: 'removed'});
	}
	function runScheduler(force, callback){
		if(!callback) callback = function(){};

		list(function(error, data){			
			data.forEach(function(itm){
				get(itm.name, function(error, task){
					startSchedule(task, callback, force);
				});
			});
		});
	}
	function startSchedule(task, callback, force){		
		if(scheduledTasks[task.name] && !force) return callback();
		if(scheduledTasks[task.name] && force) stopSchedule(task.name);
		if(!task.schedule && !task.continuous) return callback();		
		
		if(task.schedule){
			try { new CronJob(task.schedule); }
			catch(e) {

				logger.log('task',{
					status: 'error',
					type: 'task',
					error: e,
					message: 'Task schedule error'
				});

				if(callback) {
					return callback({message: task.name + ': Invalid pattern.'});
				} else {
					return;
				}
			}

			logger.log('task',{
				status: 'success',
				type: 'task',
				message: task.name + ': Cron task running by ' + task.schedule
			});

			scheduledTasks[task.name] = new CronJob(
				task.schedule,
				function(){ 
					logger.log('task', {
						type: 'task',
						status: 'success',
						name: task.name,
						stage:'scheduled',
						operation:'start'
					});
					run(task.name, task.parameters, null, function(){
						logger.log('task', {
							type: 'task',
							status: 'success',
							name: task.name,
							stage:'scheduled',
							operation:'end'
						});
						if (callback) callback(null, {
							message: task.name + ': Task run done',
							timestamp: new Date().toISOString() 
						});
					});
				},
				function(){},
				true);
		}

		if(task.continuous){
			logger.log('task', {
				type: 'task',
				status: 'success',
				name: task.name,
				stage:'continuous',
				operation:'start'
			});
			
			//extend API for stopSchedule
			task.stop = function(){
				//TODO: force task stop (circuit breaker)
			};
			scheduledTasks[task.name] = task;

			run(task.name, task.parameters, null, function(){
				logger.log('task', {
					type: 'task',
					status: 'success',
					name: task.name,
					stage:'continuous',
					operation:'end'
				}); 
				if (callback) callback(null, {
					message: task.name + ': Task run done',
					timestamp: new Date().toISOString() 
				});
			});
		}
	}
	function stopSchedule(name){
		if(!scheduledTasks[name]) return;
		
 		scheduledTasks[name].stop();
 		delete scheduledTasks[name];
 		logger.log('task',{
			type: 'task',
			status: 'success',
			name: name,
			stage: 'scheduled',
 			operation: 'stopped'
 		});
	}
	function run(name, params, httpContext, callback){
		runner.context.params = params;
		runner.context.task = {};
		runner.context.task.params = params;
		runner.context.task.method = '';
		runner.context.task.headers = {};
		runner.context.task.response = null;

		if(httpContext){
			runner.context.task.method = httpContext.request.method;
			runner.context.task.headers = httpContext.request.headers;
			runner.context.task.response = httpContext.response;
		}
		
		runner.context.onDone(function(error, data, contentType){
			logger.log('task', {
				type: 'task',
				status: 'success',
				name: name,
				stage: 'execution',
				operation: 'done'
			});

			callback(error, data, contentType);
		});
		logger.log('task', {
			type: 'task',
			status: 'success',
			name: name,
			stage: 'execution',
			operation: 'running'
		});		
		runner.run(name);
		if(global.gc) global.gc();
	}

	function _rmdirRecursive(path) {
		var error = '';
		if(fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function(file){
				var curPath = path + '/' + file;
				if(fs.lstatSync(curPath).isDirectory()) _rmdirRecursive(curPath);
				else fs.unlinkSync(curPath);
			});
			return fs.rmdirSync(path);
		}
		return error;
	}
	function _mkdirRecursive(dirPath, mode) {
		try{
			fs.mkdirSync(dirPath, mode);
		}catch(e){
			if(e && e.errno === 34){
				_mkdirRecursive(path.dirname(dirPath), mode);
				_mkdirRecursive(dirPath, mode);
			}
		}
	}
};
