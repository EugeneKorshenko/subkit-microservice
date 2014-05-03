

<!-- Start lib/eventsource.module.js -->

@module eventsource

Async result callback.

### Params: 

* **Object** *error* 
* **Object** *data* 

## exports(storage, pubsub)

eventsource module.

### Params: 

* **Object** *storage* - Store module dependency.
* **Object** *pubsub* - PubSub module dependency.

## append(key, value)

Append a message to log.

### Params: 

* **String** *key* - Message key.
* **Object** *value* - Message payload.

## get(callback)

Get all messages from log.

### Params: 

* **callback** *callback* 

## reduce(initial, selector, callback)

Reduce (left fold) message to a state.

### Params: 

* **Object** *initial* - Initial state.
* **Function** *selector* - A selector function.
* **callback** *callback* 

## getState(projectionName)

Gets the current state of projection.

### Params: 

* **String** *projectionName* - Name of projection.

### Return:

* **Object** - Current state of projection.

## runLive(projectionName, projection, -)

Run a projection in live mode.

### Params: 

* **String** *projectionName* - Name of projection.
* **Function** *projection* - The projection function.
* **Object** *-* A message to process.

## runAdHoc(streamName, patternMatch)

Run a projection in adhoc mode.

### Params: 

* **String** *streamName* - Name of message stream.
* **Function** *patternMatch* - The pattern matching function.

<!-- End lib/eventsource.module.js -->

