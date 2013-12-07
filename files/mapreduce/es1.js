log("MapReduce: " + params.key + " started");
eventsource.live("mypubsubaggegator", {
			$init: function(state){
				log("init");
				log(state)
				state.count = state.count || 0;
				state.events = state.events || [];
				return state;
			},
			bucket1: function(state, event){
				state.count++;
				state.events.push(event);
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