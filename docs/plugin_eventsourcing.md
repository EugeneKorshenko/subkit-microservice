Event Sourcing Projections
----

eventsource.projection("mypubsub", {
			$init: function(state){
				state.count = state.count || 0;
				state.events = state.events || [];
				return state;
			},
			$completed: function(state){
                                response(null,state);
			},
			first: function(state, event){
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