'use strict';

var fs = require('fs'),
	path = require('path');

module.exports.init = function(server, es, helper, doc){

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
	eventsource_doc.get('/eventsource', 'Receive all messages from a stream.', {
	    nickname: 'receive',
		responseClass: 'List[Value]',
		parameters: [
			{name: 'channel', description: 'channel name', required:true, dataType: 'string', paramType: 'path'},
			{name: 'clientId', description: 'client id', required:true, dataType: 'string', paramType: 'path'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});


	server.get('/eventsource/projection/channel/:name', helper.apiAuth, function(req, res, next){
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

	server.get('/eventsource', helper.apiAuth, function(req, res, next){
		es.get(function(err, data){
			res.send(data);
		});
	});
	server.get('/eventsource/projections/:name', helper.apiAuth, function(req, res, next){
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Patameter not set.'));

		res.send(200, []);
	});
	server.post('/eventsource/projections/:name', helper.apiAuth, function(req, res, next){
		var name = req.params.name;
		var payload = req.body;
		if(!name) return res.send(400, new Error('Patameter not set.'));
		if(!payload) return res.send(400, new Error('Payload not set.'));

		res.send(201, {message:'created'});
	});
	server.put('/eventsource/projections/:name', helper.apiAuth, function(req, res, next){
				var name = req.params.name;
		var payload = req.body;
		if(!name) return res.send(400, new Error('Patameter not set.'));
		if(!payload) return res.send(400, new Error('Payload not set.'));

		res.send(202, {message:'changed'});
	});
	server.del('/eventsource/projections/:name', helper.apiAuth, function(req, res, next){
		var name = req.params.name;
		if(!name) return res.send(400, new Error('Patameter not set.'));

		res.send(202, {message:'removed'});
	});
};