#Event-Driven Style API

Subkit expose a event-driven style API for building many different types of modern and next-generation apps, such as:

* Real-Time BI dashboard and data analytics apps
* Event-Driven apps with web browsers as universal clients
* Message-intensive apps such as multiplayer games
* Social streaming and live messaging apps
* Stock exchange apps that relay trading data in real-time

Event-Driven style attributes include:

* Client and server listens for new events
* Events are transmitted as they occur via asynchronous messages 

##Publish/Subscribe
All messages that transmitted are partitioned via topics. A topic is the name of the channel, a store or a projection. A message partition is named by choosen topic and is called stream.

###Publish
Publish a message to a stream.
```
pubsub
.publish(topic, key, value, function(error, message){
	
});
```

Publish a message without checking the consistency of a stream. (coming soon)
```
pubsub
.tryPublish(topic, key, value, function(error, message){
	
});
```

###Subscribe
```
pubsub
.subscribe(topic, clientId, function(error, message){
	
});
```

```
pubsub
.on(topic, JSONQuery, clientId, function(error, message){
	
});
```

###Message Schema
```
{
	type: 'put' || 'delete' || 'append',
	source: 'store' || 'channel' || 'projection',
	channel: {name},
	store: {name},
	key: {name},
	timestamp: {datetime},
	version: {number},
	value: {object}
}
```

##Event-Store
Gets all messages from stream.
```
eventsource
.fromStreams(topics)
.stream(function(error, stream){
	
});
```

##Event Stream analytics with state transformations
A stream of events (messages) is a representation of state changes over time. To get the current state of the event stream, you should use our Stream Projection API. The Projection API iterate over the selected streams, gets the messages from each stream and you can filter, map and reduce them to a resulting state. 

```
eventsource
.fromStreams(topics)
.run(projection, isPersistentTask, function(error, data){
	
});

```

###Projection API
You can filter, map and reduce messages over the selected message streams to build a continuous resulting state by using the Projection API.  

1. Use `fromStreams(topics)` to filter messages by channel, store or projection name.  
2. Use the message key (message identifier) to filter (pattern match over message key) and dispatch a message from the selected stream to a corresponding map/reduce (select/aggregate) function.  
3. Use `$init` to build an initial state.  
4. Use `$completed` to transform the resulting state.  

```
{
	$init: function(state){
		return state;
	},
	$completed: function(state){
		return state;
	},
	{channel or store name}: function(state, message){
		return state;
	}
}
```

###Projection API Filter/Map/Reduce Examples
Run a non persistent projection over the streams "foo" and "bar". 
```
eventsource
.fromStreams(['foo', 'bar'])
.run('fooBarProjection', {
	//Generate initial state
	$init: function(state){
		state.count = state.count || 0;
		state.events = state.events || [];
		return state;
	},
	//Transform the resulting state 
	$completed: function(state){
		res.end(JSON.stringify(state));
	},
	// Map/Reduce messages with message key "channel1"
	channel1: function(state, message){
		state.count++; 
		state.events.push(message); // MAP
	},
	// Map/Reduce messages with message key "store1"
	store1: function(state, message){
		state.count++;
		state.events.push(message);
	},
	// Map/Reduce messages with message key "projection1"
	projection1: function(state, message){
		state.count++;
		state.events.push(message);
	}
}, false);
```

### Get current state.
```
eventsource
.get('fooBarProjection', function(error, data){
	
});
```
### Receive state continuously.
```
eventsource
.fromStreams('fooBarProjection')
.on(JSONQuery, function(error, data){
	
});
```

##Staged Event-Driven Architecture (SEDA)
Every projection expose their resulting state continuously via the return value from the $completed function and via a channel named by projection. This concept allows you to staging the resulting states from the projection to a new streams. The overall result is a stream of streams and this is also called staged event-driven.