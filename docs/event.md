

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

## bindWebHook(stream, webhookId, JSONquery, apikey)

WebHook bind to a stream.

### Params:

* **String** *stream* - Name of stream
* **String** *webhookId* - WebHook callback URL
* **Object** *JSONquery* - JSONquery message filter
* **String** *apikey* - WebHook URL API-Key

## unbindWebHook(stream, webhookId)

Unbind WebHook from a stream.

### Params:

* **String** *stream* - Name of stream
* **String** *webhookId* - WebHook callback URL

## emit(stream, payload, metadata, persistent, callback)

Publish a message to a stream.

### Params:

* **String** *stream* - Name of stream
* **Object** *payload* - The message payload
* **Object** *metadata* - The message metadata
* **Bool** *persistent* - Persist message to store
* **callback** *callback* - Done handler

## on(stream, JSONquery, callback)

Hook into the raw message stream.

### Params:

* **String** *stream* - Name of stream
* **Object** *JSONquery* - JSONquery message filter
* **callback** *callback* - Done handler

## eventStream(stream, JSONquery)

Message stream.

### Params:

* **String** *stream* - Name of stream
* **Object** *JSONquery* - JSONquery message filter

## once(stream, JSONquery, callback)

Hook into the raw message stream once.

### Params:

* **String** *stream* - Name of stream
* **Object** *JSONquery* - JSONquery message filter
* **callback** *callback* - Done handler

## getStreams(callback)

Get all available streams.

### Params:

* **callback** *callback* - Done handler

## log(resource, options, JSONquery, callback)

Get events from a persistent stream by using a json query. 

### Params:

* **String** *resource* - Name of stream
* **Object** *options* - Query options
* **Object** *JSONquery* - Filter as JSON-Query
* **callback** *callback* - Done handler

## log(resource, callback)

Delete all events from a persistent stream. 

### Params:

* **String** *resource* - Name of stream
* **callback** *callback* - Done handler

<!-- End lib/event.module.js -->

