

<!-- Start lib/event.module.js -->

Async result callback.

### Params:

* **Object** *error* 
* **Object** *data* 

## exports(config, store)

Event module.

### Params:

* **Object** *config* - Configuration dependency.
* **Object** *store* - Store module dependency.

## unsubscribe(channel, clientId)

Unsubscribe from a channel.

### Params:

* **String** *channel* - Name of channel.
* **String** *clientId* - Unique client key.

## subscribe(channel, clientId, callback)

Subscribe to a channel.

### Params:

* **String** *channel* - Name of channel.
* **String** *clientId* - Unique client key.
* **callback** *callback* 

## subscribePersistent(channel, clientId, callback)

Persistent subscribe to a channel.

### Params:

* **String** *channel* - Name of channel.
* **String** *clientId* - Unique client key.
* **callback** *callback* 

## publish(channel, key, message)

Publish (Fanout) a message to a channel.

### Params:

* **String** *channel* - Name of channel.
* **String** *key* - Unique message key.
* **Object** *message* - The message payload.

## publishPersistent(channel, key, message)

Publish (Fanout) a message to a channel and persist to store.

### Params:

* **String** *channel* - Name of channel.
* **String** *key* - Unique message key.
* **Object** *message* - The message payload.

## send(clientId, message)

Send (Point-to-point) a message to a unique client key.

### Params:

* **String** *clientId* - Receiver client key.
* **Object** *message* - The message payload.

## sendPersistent(clientId, message)

Send (Point-to-point) a message to a unique client key and persist to store.

### Params:

* **String** *clientId* - Receiver client key.
* **Object** *message* - The message payload.

## on(callback)

Hook into the raw message stream.

### Params:

* **callback** *callback* 

## once(callback)

Hook into the raw message stream once.

### Params:

* **callback** *callback* 

## getChannels(callback)

Get all available channels.

### Params:

* **callback** *callback* 

## getClients(callback)

Get all available clients.

### Params:

* **callback** *callback* 

## getChannelsByClientId(clientId, callback)

Get channels grouped by client key.

### Params:

* **String** *clientId* 
* **callback** *callback* 

## getClientsByChannel(channel, callback)

Get clients grouped by channel name.

### Params:

* **String** *channel* 
* **callback** *callback* 

## history(resource, options, queryString, callback)

Get messages from a channel by using a json query. 

### Params:

* **String** *resource* - Name of channel.
* **Object** *options* - Query options.
* **String** *queryString* - JSON Query options.
* **callback** *callback* - Done handler.

<!-- End lib/event.module.js -->

