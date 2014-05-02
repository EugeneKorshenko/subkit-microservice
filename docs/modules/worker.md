

<!-- Start lib/worker.module.js -->

@module worker

Async result callback.

### Params: 

* **Object** *error* 
* **Object** *data* 

## exports(config, store, pubsub, es)

Worker module.

### Params: 

* **Object** *config* - Configuration.
* **Object** *store* - Store module dependency.
* **Object** *pubsub* - PubSub module dependency.
* **Object** *es* - EventSource module dependency.

## runTask(resource, params, callback)

Get channels grouped by client key.

### Params: 

* **String** *resource* - Name of script.
* **Object** *params* - Script parameters.
* **callback** *callback* 

## runJob(resource, params, callback)

Get channels grouped by client key.

### Params: 

* **String** *resource* - Name of script.
* **Object** *params* - Script parameters.
* **callback** *callback* 

<!-- End lib/worker.module.js -->

