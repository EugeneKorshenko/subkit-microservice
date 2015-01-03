'use strict';

var fs = require('fs'),
	path = require('path'),
	uuid = require('node-uuid'),
	CronJob = require('cron').CronJob,
	CronTime = require('cron').CronTime;

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
module.exports = function (config, storage, event, es, template, file, doc) {
	module.exports.init(config, storage, event, es, template, file, doc);
};
module.exports.init = function(conf, storage, event, es, template, file, doc){
	if(!conf) throw new Error('No configuration found.');

	var self = this,
		config = conf,
		tasks = require('./tasks'),
		scheduledTasks = {},
		runner,
		task_doc;

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

	var _init = function(taskConfig){
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
					on: event.on
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
		});

		task_doc = doc ? doc('task', 'Task operations.') : { get: function(){} };
		return self;
	};

	var _get = function(name, callback){
		var pathToTask = path.join(config.tasksPath, name);
		var taskExists = fs.existsSync(pathToTask);
		if(!taskExists) return callback(new Error('Task not found'));

		fs.readFile(path.join(pathToTask, 'definition.json'), function(error, data){
			if(!data) data = '{}';
			data = JSON.parse(data);
			data.taskScript = fs.readFileSync(path.join(pathToTask, 'task.js'), 'utf8');
			callback(error, data);
		});
	};
	var _list = function(callback){
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
	};
	var _set = function(name, task, callback){
		var error = '';
		var pathToTask = path.join(config.tasksPath, name);
		var taskExists = fs.existsSync(pathToTask);
		if(!taskExists) error = fs.mkdirSync(pathToTask);
		error = fs.writeFileSync(path.join(pathToTask, 'definition.json'), JSON.stringify(task, null, 4));
		error = fs.writeFileSync(path.join(pathToTask, 'task.js'), task.taskScript);
		_startSchedule(task, function(error, data){
			callback(error, { message: 'created'});	
		}, true);
	};
	var _remove = function(name, callback){
		_stopSchedule(name);
		var error = '';
		var pathToTask = path.join(config.tasksPath, name);
		error = _rmdirRecursive(pathToTask);
		callback(error, {message: 'removed'});
	};

	var _runScheduler = function(force, callback){
		if(!callback) callback = function(error, data){};

		_list(function(error, data){			
			data.forEach(function(itm){
				_get(itm.name, function(error, task){
					_startSchedule(task, callback, force);
					if(task.name && task.description && task.documentation)
						task_doc.get('/tasks/action/run/' + task.name, task.description, task.documentation);
				});
			});
		});
	};
	var _startSchedule = function(task, callback, force){		
		if(scheduledTasks[task.name] && !force) return callback();
		if(scheduledTasks[task.name] && force) _stopSchedule(task.name);
		if(!task.schedule && !task.continuous) return callback();		
		
		if(task.schedule){
			try { new CronJob(task.schedule); }
			catch(ex) { if(callback) { return callback({message: task.name + ': Invalid pattern.'});} else {return;} }

			console.log(task.name + ': Cron task running by ' + task.schedule);
			scheduledTasks[task.name] = new CronJob(
				task.schedule,
				function(){ 
					event.emit('log!task',task.name, {name: task.name, stage:'scheduled', status:'start', timestamp: new Date().toISOString() });
					_run(task.name, task.parameters, null, function(){
						event.emit('log!task',task.name, {name: task.name, stage:'scheduled', status:'end', timestamp: new Date().toISOString() });
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
			console.log(task.name + ': Continuous task running.');
			event.emit('log!task',task.name, {name: task.name, stage:'continuous', status:'start', timestamp: new Date().toISOString() });
			
			//extend API for _stopSchedule
			task.stop = function(){
				//TODO: force task stop (circuit breaker)
			};
			scheduledTasks[task.name] = task;

			_run(task.name, task.parameters, null, function(){
				event.emit('log!task',task.name, {name: task.name, stage:'continuous', status:'end', timestamp: new Date().toISOString() }); 
				if (callback) callback(null, {
					message: task.name + ': Task run done',
					timestamp: new Date().toISOString() 
				});
			});
		}
	};
	var _stopSchedule = function(name){
		if(!scheduledTasks[name]) return;
		
 		scheduledTasks[name].stop();
 		delete scheduledTasks[name];
 		console.log(name + ': Task stopped');
	};

	var _run = function(name, params, httpContext, callback){
		var outLog = [];
		runner.context.params = params;
		
		if(httpContext){
			runner.context.task = {};	
			runner.context.task.params = params;
			runner.context.task.method = httpContext.request.method;
			runner.context.task.headers = httpContext.request.headers;
			runner.context.task.response = httpContext.response;
		}
		
		runner.context.onResponse(function(error, data, contentType){
			event.emit('log!task',name, {name: name, stage:'task', status:'done', timestamp: new Date().toISOString()});
			callback(error, data, contentType, outLog);
		}, function(text){
			outLog.push(text);
		});
		runner.onScriptError(function(error, data, contentType){
			event.emit('log!task',name, {name: name, stage:'task', status:'error', message: error, timestamp: new Date().toISOString()});
			console.log(error)
			callback(error, data, contentType, outLog);
		});
		event.emit('log!task',name, {name: name, stage:'task', status:'run', timestamp: new Date().toISOString()});
		runner.run(name);
		if(global.gc) global.gc();
	};

	_init(config);

	var Task = function(name, params){
		var self = this;
		self.name = name;
		self.description = '';
		self.schedule = '';
		self.continuous = false;
		self.taskScript = 'response(null, {});';
		self.parameters = params || {};
	};

	return {
		/**
		* (Re)init the task modules.
		* @memberOf module:task#
		* @method init
		* @param {Object} taskConfig - The task configuration.
		*/
		init: _init,
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
		run:_run,
		/**
		* Save a task.
		* @memberOf module:task#
		* @method set
		* @param {String} name - Name of script.
		* @param {Object} task - A Task object.
		* @param {callback} callback
		*/
		set:_set,
		/**
		* Removes a task.
		* @memberOf module:task#
		* @method remove
		* @param {String} name - Name of script.
		* @param {callback} callback
		*/
		remove:_remove,
		/**
		* Gets a task by name.
		* @memberOf module:task#
		* @method get
		* @param {String} name - Name of script.
		* @param {callback} callback
		*/
		get:_get,
		/**
		* List tasks.
		* @memberOf module:task#
		* @method list
		* @param {callback} callback
		*/
		list:_list,
		/**
		* Starts the scheduler.
		* @memberOf module:task#
		* @method runScheduler
		* @param {callback} callback
		*/
		runScheduler:_runScheduler
	};
};