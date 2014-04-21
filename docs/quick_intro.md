Quick Intro
----
Subkits goal is simplicity to build web and mobile apps. But how easy it is?  

#JavaScript
1. Include our JavaScript library in the `<head>`  
`<script type='text/javascript' src='https://try.subkit.io/sdk/subkit.js'></script>`
2. Create a Subkit instance  
```
var subkit = new Subkit({
	baseUrl: 'https://try.subkit.io',
	apiKey: '4220c6c2-5125-45ac-9b1a-37ae127c4545'
});
```
3. Create a Subkit store instance  
`var quickstart = new subkit.store('quickstart');`
4. Storing data  
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
4. Loading data  
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
