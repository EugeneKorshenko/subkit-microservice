#Worker Tasks API

Store Functions
---

_store.read()_  
```
store.read()
```

_store.query()_  
```
store.query()
```

_store.upsert()_  
```
store.upsert()
```

_store.del()_  
```
store.del()
```  

JSON-HTTP Functions
---

_json.post(resource, payload, callback)_   
_json.put(resource, payload, callback)_   
_json.get(resource, callback)_  
_json.del(resource, callback)_  

Message-Bus Functions
---

_messagebus.publish(resource, key, payload)_  
_messagebus.on(query, callback)_  

Event-Source Functions
---

_eventsource.projection(...)_  
_eventsource.live(...)_  
_eventsource.state(...)_  


Common Functions
---
_done(error, data, contentType)_  
_log(text)_  
_timeout(func, milliseconds)_  
_interval(func, milliseconds)_  
_stop(ref)_  
_debug(text)_  
_Flow(...)_  


Examples
----

_Server-Side console output_  
```
debug("task console output");
done(null, {data:"task console output"});
```

_Server-Side timer interval_  
```
var c = 0;
interval(function(){
	log(c++);
},1000);
log("started");
var self = this;
log(self);
done(null, {msg:"started"});
```

