'use strict';

module.exports.init = function(doc){

	var task_doc = doc('tasks', 'Task operations.');
	task_doc.models.Value = {
		id: 'Value',
		properties: {
  		}
	};

	task_doc.get('/tasks', 'List tasks.', {
	    nickname: 'listTasks',
		responseClass: 'List[string]',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X GET {BASEURI}/tasks',
		parameters: [],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});
	task_doc.get('/tasks/{name}', 'List tasks.', {
	    nickname: 'getTask',
		responseClass: 'object',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X GET {BASEURI}/tasks/{name}',
		parameters: [],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});	
	task_doc.post('/tasks/{name}', 'Add a task.', {
		nickname: 'addTask',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X POST {BASEURI}/tasks/{name}',
		parameters: [
			{name: 'name', description: 'Name of task.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});
	task_doc.put('/tasks/{name}', 'Update a task.', {
		nickname: 'updateTask',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X PUT {BASEURI}/tasks/{name}',
		parameters: [
			{name: 'name', description: 'Name of task.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});	
	task_doc.delete('/tasks({name}', 'Remove a Task.', {
		nickname: 'removeTask',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X DELETE {BASEURI}/tasks/{name}',
		parameters: [
			{name: 'name', description: 'Name of task.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});

	task_doc.get('/tasks/action/run/{name}', 'Run a task.', {
	    nickname: 'runTask',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X GET {BASEURI}/tasks/action/run/{name}',
		parameters: [
			{name: 'name', description: 'Name of task.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});
	task_doc.post('/tasks/action/run/{name}', 'Run a task.', {
		nickname: 'runTask',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X POST {BASEURI}/tasks/action/run/{name}',
		parameters: [
			{name: 'name', description: 'Name of task.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});

};