

<!-- Start lib/store.module.js -->

Async result callback.

### Params:

* **Object** *error* 
* **Object** *data* 

## exports(config)

JSON key/value storage module.

### Params:

* **Object** *config* 

## stores(callback)

List stores.

### Params:

* **callback** *callback* 

## query(resource, options, queryString, callback)

Get items from a store by using a json query.

### Params:

* **String** *resource* - Name of store.
* **Object** *options* - Query options.
* **String** *queryString* - JSON Query options.
* **callback** *callback* - Done handler.

## insert(resource, payload, callback)

Add an item in a store.

### Params:

* **String** *resource* - Name of store.
* **Object** *payload* - New data object.
* **callback** *callback* - Done handler.

## update(resource, key, payload, callback)

Update an item in a store.

### Params:

* **String** *resource* - Name of store.
* **String** *key* - Store item key.
* **Object** *payload* - New data object.
* **callback** *callback* - Done handler.

## tryUpdate(resource, key, payload, callback)

Try to add or change an item in a store.

### Params:

* **String** *resource* - Name of store.
* **String** *key* - Store item key.
* **Object** *payload* - New data object.
* **callback** *callback* - Done handler.

## del(resource, key, callback)

Remove an item from the store.

### Params:

* **String** *resource* - Name of store.
* **String** *key* - Store item key.
* **callback** *callback* - Done handler.

## del(resource, key, version, callback)

Try to remove an item from the store.

### Params:

* **String** *resource* - Name of store.
* **String** *key* - Store item key.
* **Number** *version* - Store item version.
* **callback** *callback* - Done handler.

## batch(data, callback)

Bulk update (add, change, remove).

### Params:

* **Array** *data* - Object array with store operations.
* **callback** *callback* - Done handler.

## imports(resource, payload, callback)

Imports JSON data to a store.

### Params:

* **String** *resource* - Name of store.
* **Object** *payload* - JSON (array) to import.
* **callback** *callback* - Done handler.

## exports(resource, callback)

Exports store data as JSON.

### Params:

* **String** *resource* - Name of store.
* **callback** *callback* - Done handler.

## repair(done)

Repair storage files.

### Params:

* **callback** *done* 

## backup(done)

Backup storage files.

### Params:

* **callback** *done* 

## restore(name, done)

Restore storage files.

### Params:

* **String** *name* - Backup name.
* **callback** *done* 

## destroy(done)

Delete storage files.

### Params:

* **callback** *done* 

## close()

Close the storage file handles.

## statistics(done)

Get storage statistics.

### Params:

* **callback** *done* 

## onChange(callback)

Store change notifications.

### Params:

* **callback** *callback* - Done handler.

<!-- End lib/store.module.js -->

