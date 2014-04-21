#Store Module API

### _Configuration_
```
var path = require('path');
var store = require('./lib/store.module.js').init({
	dbPath: path.join(__dirname, "./mydb"),
	rightsPath: path.join(__dirname, "./rights.json"),
	backupPath: path.join(__dirname, "./backups")
});
```
### _getRights_
Returns current rights settings.  
```
store.getRights();
```
### _setPublic_
Sets a store to public. 
```
store.setPublic(<storeName>, <callback>);
```