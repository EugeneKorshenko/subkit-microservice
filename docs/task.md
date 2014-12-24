

<!-- Start lib/task.module.js -->

Async result callback.

### Params:

* **Object** *error* 
* **Object** *data* 

## exports(config, store, hook, es)

Worker module.

### Params:

* **Object** *config* - Configuration.
* **Object** *store* - Store module dependency.
* **Object** *hook* - Hook module dependency.
* **Object** *es* - EventSource module dependency.

## init(workerConfig)

(Re)init the worker modules.

### Params:

* **Object** *workerConfig* - The worker configuration.

## Task(name, params)

Creates a new Task.

### Params:

* **String** *name* - Name of script.
* **Object** *params* - Script parameters.

## run(name, params, callback)

Run a task.

### Params:

* **String** *name* - Name of script.
* **Object** *params* - Script parameters.
* **callback** *callback* 

## set(name, task, callback)

Save a task.

### Params:

* **String** *name* - Name of script.
* **Object** *task* - A Task object.
* **callback** *callback* 

## remove(name, callback)

Removes a task.

### Params:

* **String** *name* - Name of script.
* **callback** *callback* 

## get(name, callback)

Gets a task by name.

### Params:

* **String** *name* - Name of script.
* **callback** *callback* 

## list(callback)

List tasks.

### Params:

* **callback** *callback* 

## runScheduler(callback)

Starts the scheduler.

### Params:

* **callback** *callback* 

<!-- End lib/task.module.js -->

