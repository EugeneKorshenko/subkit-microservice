

<!-- Start lib/store.module.js -->

@module store

Async result callback.

### Params: 

* **Object** *error* 
* **Object** *data* 

## exports(config)

JSON key/value storage module.

### Params: 

* **object** *config* 

## stores(callback)

Description

### Params: 

* **** *callback* 

## query(resource, options, queryString, callback)

Description

### Params: 

* **** *resource* 
* **** *options* 
* **** *queryString* 
* **** *callback* 

## create(resource, key, payload, callback)

Description

### Params: 

* **** *resource* 
* **** *key* 
* **** *payload* 
* **** *callback* 

## update(resource, key, payload, callback)

Description

### Params: 

* **** *resource* 
* **** *key* 
* **** *payload* 
* **** *callback* 

## del(resource, key, callback)

Description

### Params: 

* **** *resource* 
* **** *key* 
* **** *callback* 

## batch(data, callback)

Description

### Params: 

* **** *data* 
* **** *callback* 

## first(resource, callback)

Description

### Params: 

* **** *resource* 
* **** *callback* 

## importJSON(resource, payload, callback)

Description

### Params: 

* **** *resource* 
* **** *payload* 
* **** *callback* 

## exportJSON(resource, callback)

Description

### Params: 

* **** *resource* 
* **** *callback* 

## destroy(done)

Description

### Params: 

* **** *done* 

## close()

Description

## repair(done)

Description

### Params: 

* **** *done* 

## statistics(done)

Description

### Params: 

* **** *done* 

## backup(done)

Description

### Params: 

* **** *done* 

## restore(name, done)

Description

### Params: 

* **** *name* 
* **** *done* 

## read(resource, options, callback)

Gets items from a store.

### Params: 

* **String** *resource* 
* **Object** *options* 
* **callback** *callback* 

## onChange(callback)

Description

### Params: 

* **callback** *callback* 

<!-- End lib/store.module.js -->

