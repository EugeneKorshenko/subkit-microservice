log("MapReduce: " + params.key + " started");
eventsource.live("mypubsub", {
			$init: function(state){
				log("init");
				log(state)
				state.count = state.count || 0;
				state.events = state.events || [];
				return state;
			},
			$completed: function(state){
				log("completed");
				log(state);
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