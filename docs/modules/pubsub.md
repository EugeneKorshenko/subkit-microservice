

<!-- Start lib/pubsub.module.js -->

@module pubsub

Async result callback.

### Params: 

* **Object** *error* 
* **Object** *data* 

## exports(config)

PubSub module.

### Params: 

* **object** *config* 

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

## publish(channel, key, message)

Publish (Fanout) a message to a channel.

### Params: 

* **String** *channel* - Name of channel.
* **String** *key* - Unique message key.
* **Object** *message* - The message payload.

## send(clientId, message)

Send (Point-to-point) a message to a unique client key.

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

<!-- End lib/pubsub.module.js -->

