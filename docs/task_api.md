callback(err, value)
store.list(calback)
store.read(resource, options, callback)
store.query(resource, options, queryString, callback)
store.upsert(resource, key, payload, callback)
store.del(resource, key, callback)

callback(err, value)
json.post(resource, payload, callback)
json.put(resource, payload, callback)
json.get(resource, callback)
json.del(resource, callback)
json.on(resource, clientId, callback)

callback(err, value)
messagebus.publish(channel, key, message)
messagebus.on(query, callback)

eventsource
.fromStreams(streamArray, partition)
.history(callback)
.run(patternMatch, callback)
.on(patternMatch, callback)

file.list(callback)
file.write(name, value,callback)
file.read(name, calback)
file.del(name, callback)

template.render(templateName, options, callback)

timeout(function, milliseconds)
stop(timeoutReference)
debug(text)

uuid.v1()
uuid.v4()
randomString.generate(length)
Flow:Flow,
_