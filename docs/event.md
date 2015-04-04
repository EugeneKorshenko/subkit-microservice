

<!-- Start lib/event.module.js -->

Async result callback.

### Params:

* **Object** *error* 
* **Object** *data* 

## exports(config, store, logger)

Event module.

### Params:

* **Object** *config* - Configuration dependency.
* **Object** *store* - Store module dependency.
* **Object** *logger* - Logger module dependency.

## bind(stream, JSONquery, callback)

Bind to a stream.

### Params:

* **String** *stream* - Name of stream.
* **Object** *JSONquery* - JSONquery message filter.
* **callback** *callback* 

## bindPersistent(stream, JSONquery, callback)

Persistent bind to a stream.

### Params:

* **String** *stream* - Name of stream.
* **Object** *JSONquery* - JSONquery message filter.
* **callback** *callback* 

## bindWebHook(stream, JSONquery, clientId)

WebHook bind to a stream.

### Params:

* **String** *stream* - Name of stream.
* **Object** *JSONquery* - JSONquery message filter.
* **String** *clientId* - WebHook callback address.

## unbind(stream, clientId)

Unbind from a stream.

### Params:

* **String** *stream* - Name of stream.
* **String** *clientId* - WebHook callback address.

## emit(stream, message, metadata, persistent)

Publish a message to a stream.

### Params:

* **String** *stream* - Name of stream.
* **Object** *message* - The message payload.
* **Object** *metadata* - The message metadata.
* **Bool** *persistent* - Persist message to store.

## on(JSONquery, callback)

Hook into the raw message stream.

### Params:

* **Object** *JSONquery* - JSONquery message filter.
* **callback** *callback* 

## eventStream(JSONquery)

Message stream.

### Params:

* **Object** *JSONquery* - JSONquery message filter.

## once(callback)

Hook into the raw message stream once.

### Params:

* **callback** *callback* 

## getChannels(callback)

Get all available streams.

### Params:

* **callback** *callback* 

## getClients(callback)

Get all available clients.

### Params:

* **callback** *callback* 

## getChannelsByClientId(clientId, callback)

Get streams grouped by client key.

### Params:

* **String** *clientId* 
* **callback** *callback* 

## getClientsByChannel(stream, callback)

Get clients grouped by stream name.

### Params:

* **String** *stream* 
* **callback** *callback* 

## log(resource, options, queryString, callback)

Get events from a persistent stream by using a json query. 

### Params:

* **String** *resource* - Name of stream.
* **Object** *options* - Query options.
* **String** *queryString* - JSON Query options.
* **callback** *callback* - Done handler.

## log(resource, callback)

Delete all events from a persistent stream. 

### Params:

* **String** *resource* - Name of stream.
* **callback** *callback* - Done handler.

<!-- End lib/event.module.js -->

