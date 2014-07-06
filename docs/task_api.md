Task API
---

Execute custom JavaScript tasks by:  

* HTTP request/response
* scheduled 
* continuously

Every task is executing isolated from instance process by using a sandboxed virtual machine. The Task-API fully supports JavaScript and some API extentions to accessing the Subkit-Modules.

Callbacks
--
`callback(err, value)`

Store
--
`store.list(calback)`
`store.read(resource, options, callback)`
`store.query(resource, options, queryString, callback)`
`store.upsert(resource, key, payload, callback)`
`store.del(resource, key, callback)`

JSON Client
--
`json.post(resource, payload, callback)`
`json.put(resource, payload, callback)`
`json.get(resource, callback)`
`json.del(resource, callback)`
`json.on(resource, clientId, callback)`

Message Bus
--
`messagebus.publish(channel, key, message)`
`messagebus.on(query, callback)`

Event-Store
--
`
eventsource
	.fromStreams(streamArray, partition)
	.history(callback)
	.run(patternMatch, callback)
	.on(patternMatch, callback)
`

Static Files
--
`file.list(callback)`
`file.write(name, value,callback)`
`file.read(name, calback)`
`file.del(name, callback)`

Templates
--
`template.render(templateName, options, callback)`

Utils
--
`timeout(function, milliseconds)`
`stop(timeoutReference)`
`debug(text)`
`uuid.v1()`
`uuid.v4()`
`randomString.generate(length)`

Async Flows
--
`
new Flow(function, function, function)
`

Underscore.JS
-- 
[UnderscoreJS](http://underscorejs.org)
