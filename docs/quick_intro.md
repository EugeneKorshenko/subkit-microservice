Quick Intro
----
Subkits goal is simplicity to build web and mobile apps. But how easy it is?  

#JavaScript
1) Include our JavaScript library in the `<head>`  
```
<script type='text/javascript' src='http://localhost:8080/sdk/subkit.js'></script>
```
2) Create a Subkit instance  
```
var subkit = new Subkit({
	baseUrl: 'http://localhost:8080',
	apiKey: '6654edc5-82a3-4006-967f-97d5817d7fe2'
});
```
3) Create a Subkit store instance  
```
var quickstart = new subkit.store('quickstart');
```
4) Storing data  
```
quickstart
	.set('itemKey', {
		prop1: "item value"
	})
	.error(function(error){
	})
	.done(function(data){
	});
```
5) Loading    
* all data in store  
```
quickstart
	.get()
	.error(function(error){
	})
	.done(function(data){
	});
```
* data by item key  
```
quickstart
	.get('itemKey')
	.error(function(error){
	})
	.done(function(data){
	});
```


#AngularJS
