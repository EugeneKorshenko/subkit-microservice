'use strict';

var fs = require('fs'),
	path = require('path');

module.exports.init = function(server, es, helper){
	server.get('/eventsource/all', helper.apiAuth, function(req, res, next){
		es.get(function(err, data){
			res.send(data);
		});
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
	server.get('/eventsource/projection/:name', helper.apiAuth, function(req, res, next){
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
};