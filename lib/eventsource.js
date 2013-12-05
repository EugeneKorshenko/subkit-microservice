var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, es, helper){
	server.get("/eventsource/all", function(req, res, next){
		es.get(function(err, data){
			res.send(data);
		});
	});

	server.get("/eventsource/projection/:name", function(req, res, next){
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
				heartbeat: function(state, event){
					state.count++;
					state.events.push(event);
				}
			});
		res.send(200, es.getState(projectionName));
	});
};