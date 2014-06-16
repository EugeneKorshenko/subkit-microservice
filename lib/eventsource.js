'use strict';

var fs = require('fs'),
	path = require('path');

module.exports.init = function(server, es, helper, worker, doc){

	var eventsource_doc = doc('eventsource', 'EventSource operations.');
	eventsource_doc.models.Value = {
		id: 'Value',
		properties: {
		    clientId: {
		    	type: 'string'
		    },
		    channel:{
		    	type: 'string'
		    },
		    data: {
		    }
  		}
	};
	eventsource_doc.get('/eventsource/{name}', 'Receive all messages from a stream.', {
	    nickname: 'receive',
		responseClass: 'List[Value]',
		parameters: [
			{name: 'name', description: 'name', required:false, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	eventsource_doc.get('/eventsource/projections', 'List of projections.', {
	    nickname: 'listProjections',
		responseClass: 'List[Value]',
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	eventsource_doc.get('/eventsource/projections/{name}', 'Get a projection.', {
	    nickname: 'getProjection',
		responseClass: 'Value',
		parameters: [
			{name: 'name', description: 'name', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	eventsource_doc.post('/eventsource/projections/{name}', 'Create a projection.', {
	    nickname: 'receive',
		responseClass: 'List[Value]',
		parameters: [
			{name: 'name', description: 'name', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	eventsource_doc.put('/eventsource/projections/{name}', 'Change a projection.', {
	    nickname: 'receive',
		responseClass: 'List[Value]',
		parameters: [
			{name: 'name', description: 'name', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	eventsource_doc.delete('/eventsource/projections/{name}', 'Remove a projection.', {
	    nickname: 'receive',
		responseClass: 'List[Value]',
		parameters: [
			{name: 'name', description: 'name', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});

	//operations
	server.get('/eventsource/projections/channel/:name', helper.apiAuth, function(req, res, next){
		var streamName = req.params.name;
		es.runAdHoc(streamName, {
			$init: function(state){
				state.count = state.count || 0;
				state.events = state.events || [];
				return state;
			},
			$completed: function(state){
				res.end(JSON.stringify(state));
			},
			bucket1: function(state, event){
				state.count++;
				state.events.push(event);
			},
			identities: function(state, event){
				state.count++;
				state.events.push(event);
			},
			mypubsub: function(state, event){
				state.count++;
				state.events.push(event);
			}
		});
	});
	server.get('/eventsource/projections/run/:name', helper.apiAuth, function(req, res, next){
		var projectionName = req.params.name;
		es
			.projection(projectionName, {
				$init: function(state){
					state.count = state.count || 0;
					state.events = state.events || [];
					return state;
				},
				$completed: function(state){
					//res.end(JSON.stringify(state));
				},
				bucket1: function(state, event){
					state.count++;
					state.events.push(event);
				},
				identities: function(state, event){
					state.count++;
					state.events.push(event);
				},
				mypubsub: function(state, event){
					state.count++;
					state.events.push(event);
				}
			});
		res.send(200, es.getState(projectionName));
	});
	server.get('/eventsource/:name', helper.apiAuth, function(req, res, next){
		es.get(function(err, data){
			res.send(data);
		});
	});

	//projection operations
	server.get("/eventsource/projections", helper.apiAuth, function(req,res,next){
		worker.list(function(error, data){
			if(error) return res.send(400, error);
			res.send(200, data);
		});
	});
	server.get("/eventsource/projections/:name", helper.apiAuth, function (req, res, next) {
		var taskName = req.params.name;
		if(!taskName) return res.send(400, new Error('Parameter "name" not set.'));

		worker.get(taskName, function(error, data){
			if(error) return res.send(400);
			res.send(200, data);
		});
	});
	server.post('/eventsource/projections/:name', helper.apiAuth, function(req, res, next){
		var taskName = req.params.name;
		var task = req.body;
		if(!taskName) return res.send(400, new Error('Parameter "name" not set.'));
		if(!task.TaskScript) task = new worker.Task(taskName);

		worker.set(taskName, task, function(error, data){
			if(error) return res.send(400, error);
			res.send(201, {message: 'created'});
		});
	});
	server.put('/eventsource/projections/:name', helper.apiAuth, function(req, res, next){
		var taskName = req.params.name;
		var task = req.body;
		if(!taskName) return res.send(400, new Error('Parameter "name" not set.'));
		
		if(!task) task = new worker.Task(taskName);
		worker.set(taskName, task, function(error, data){
			if(error) return res.send(400, error);
			res.send(202, {message: 'changed'});
		});
	});
	server.del('/eventsource/projections/:name', helper.apiAuth, function(req, res, next){
		var taskName = req.params.name;
		if(!taskName) return res.send(400, new Error('Parameter "name" not set.'));

		worker.remove(taskName,function(error, data){
			if(error) return res.send(400, error);
			res.send(202, {message: 'removed'});
		});
	});
};