

<!-- Start lib/file.module.js -->

## exports(config)

Static file module.

### Params:

* **Object** *config* 

## list(callback)

List files.

### Params:

* **callback** *callback* 

## read(name, callback)

Read a file in static config path.

### Params:

* **String** *name* - File name.
* **callback** *callback* - Done handler.

## write(name, data, callback)

Write a file in static config path.

### Params:

* **String** *name* - File name.
* **Object** *data* - File content.
* **callback** *callback* - Done handler.

## del(name, callback)

Delete a file in static config path.

### Params:

* **String** *name* - File name.
* **callback** *callback* - Done handler.

## readDir(srcPath, callback)

Read the content of a directory in static config path.

### Params:

* **String** *srcPath* - Full source path.
* **callback** *callback* - Done handler.

## fileInfo(srcPath)

Read file information (sync).

### Params:

* **String** *srcPath* - Full source path.

## moveFile(srcPath, dstPath, callback)

Move file from source to destination.

### Params:

* **String** *srcPath* - Full source path.
* **String** *dstPath* - Full destination path.
* **callback** *callback* - Done handler.

## writeFile(name, data, callback)

Write a file.

### Params:

* **String** *name* - File name as full source path.
* **Object** *data* - File content.
* **callback** *callback* - Done handler.

## writeFile(name, callback)

Read a file.

### Params:

* **String** *name* - File name as full source path.
* **callback** *callback* - Done handler.

## delFile(name, callback)

Delete a file.

### Params:

* **String** *name* - File name as full source path.
* **callback** *callback* - Done handler.

## delDirectory(name, callback)

Delete a directory recursive.

### Params:

* **String** *name* - Directory as full source path.
* **callback** *callback* - Done handler.

## dirStatistics(name, callback)

Get the directory disk usage.

### Params:

* **String** *name* - Directory as full source path.
* **callback** *callback* - Done handler.

## tarDirectory(srcPath, dstPath, callback)

Tar a directory.

### Params:

* **String** *srcPath* - Full source path.
* **String** *dstPath* - Tar file name in full destination path.
* **callback** *callback* - Done handler.

## extractTar(srcFile, dstPath, callback)

Extract a Tar file.

### Params:

* **String** *srcFile* - Full path to Tar file.
* **String** *dstPath* - Full extract destination path.
* **callback** *callback* - Done handler.

## cleanDirectories(path)

Delete all empty directories.

### Params:

* **String** *path* - Full source path.

<!-- End lib/file.module.js -->

