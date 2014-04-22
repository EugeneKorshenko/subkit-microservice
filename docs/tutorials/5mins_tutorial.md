## Tutorial

This 5 minute tutorial will teach you the basics of Subkit.

### 1. Installing Subkit

```
<html>
  <head>
    <script src='http://localhost:8080/sdk/subkit.js'></script>
  </head>
  <body>
  </body>
</html>
```

### 2. Accessing Data
You'll need a reference to access all the data that is hosted at your Subkit backend instance. Basically, Subkit references are created by using a URL that specifies which data you want to access actually. We've already created a Subkit showcase just for you at this URL:
https://try.subkit.io
To complete this step, create a reference to the root of your Subkit as shown below:

```
<html>
  <head>
    <script src='https://try.subkit.io/sdk/subkit.js'></script>
  </head>
  <body>
  	<script>
		var subkit = new Subkit({
			baseUrl: 'https://try.subkit.io',
			apiKey: '4220c6c2-5125-45ac-9b1a-37ae127c4545'
		});
		var quickstart = new subkit.store('quickstart');
  	</script>
  </body>
</html>
```

_Great job!_
_subkit_ now references your Subkit data at https://try.subkit.io/. _quickstrart_ now references your Subkit data store "quickstart".
A core concept of Subkit is that every piece of data has its own URL. You can use this URL to access your data in several ways:
* From any Subkit client library
* From our [REST API](https://try.subkit.io/doc)
* By entering it in any browser (Try clicking the [link](https://try.subkit.io/store/quickstart) above).

### 3. Writing Data
Let's send a message  
You can use the Subkit reference you just created to write data to Subkit using the set() function.
To make things easy, we've already added input text boxes for the chatter's name and message as well as a keypress handler that will fire whenever someone tries to send a message.


For this step, write a message to Subkit using the set() function as shown:
```
quickstart
	.set('ItemKey', {
		property: 'value'
	})
	.error(function(error){
		//on error code
	})
	.done(function(data){
		//on success code
	});
```
```
<!DOCTYPE html>
<html>
	<head>
		<title>Subkit JavaScript Quick Start</title>
		<script type='text/javascript' src='http://localhost:8080/sdk/subkit.js'></script>
	</head>
	<body>
		<input type="text"/><button>Save</button>
		<h1>Items</h1>
		<ul id="items">
		</ul>
		<script>
			var saveBtn = document.getElementsByTagName('button')[0];
			var valueTxt = document.getElementsByTagName('input')[0];
			var subkit = new Subkit({
				baseUrl: 'https://try.subkit.io',
				apiKey: '4220c6c2-5125-45ac-9b1a-37ae127c4545'
			});
			var quickstart = new subkit.store('quickstart');

			saveBtn.addEventListener('click', function(){
				
				quickstart
					.set(subkit.UUID(), {
						title: valueTxt.value
						text: 'Subkit 5 mins tutorial.'
					})
					.error(function(error){
						console.log("Error: " + error);
					})
					.done(function(data){
						console.log("Successful stored.");
					});

			});
		</script>
	</body>
</html>
```
_Nice Work!_
Writing data into Subkit is as easy as calling set() on a Subkit Store reference.
Subkit can support number, boolean, and string data types — the same as a normal JavaScript object.

Subkit can handle objects of arbitrary complexity. If it can be represented as JSON, it can fit in Subkit.
When objects are written to Subkit, the structure of the object is mapped to Subkit locations. In this example, when the object {title: valueTxt.value, text: 'Subkit 5 mins tutorial.'} is set, locations for name and text are automatically created as children of the location referenced by _quickstart_.

### 5. Reading Data
Now we get data from Subkit and display the messages on the page. 

Subkit response from the 'quickstart' store is a array of items. Extract the data from the by calling the value property and assign it to a variable. Then, call the reloadQuickStart() function to display the message as shown:

Let's look how to get items from a store.

```
quickstart
	.get()
	.done(function(data){
		data.forEach(function(itm){
			console.log(itm.value.title);
		});
	});
```

```
<!DOCTYPE html>
<html>
	<head>
		<title>Subkit JavaScript Quick Start</title>
		<script type='text/javascript' src='http://localhost:8080/sdk/subkit.js'></script>
	</head>
	<body>
		<input type="text"/><button>Save</button>
		<h1>Items</h1>
		<ul id="items">
		</ul>
		<h1>History</h1>
		<ul id="history">
		</ul>
		<script>
			var saveBtn = document.getElementsByTagName('button')[0];
			var valueTxt = document.getElementsByTagName('input')[0];
			var outputList = document.getElementById('items');
			var historyList = document.getElementById('history');
			var appendToList = function(list, text){
				var newLI = document.createElement('li');
				newLI.innerHTML = text;
				list.appendChild(newLI);
			};
			var clearList = function(list){
				while(list.firstChild) list.removeChild(list.firstChild);
			};
			var reloadQuickStart = function(){
				quickstart
					.get()
					.done(function(data){
						clearList(outputList);
						data.forEach(function(itm){
							appendToList(outputList, itm.value.title);
						});
					});
			};


			var subkit = new Subkit({
				baseUrl: 'https://try.subkit.io',
				apiKey: '4220c6c2-5125-45ac-9b1a-37ae127c4545'
			});
			var quickstart = new subkit.store('quickstart');

			saveBtn.addEventListener('click', function(){
				
				quickstart
					.set(subkit.UUID(), {
						title: valueTxt.value
						text: 'Subkit 5 mins tutorial.'
					})
					.error(function(error){
						appendToList(historyList, "Error: " + error);
					})
					.done(function(data){
						appendToList(historyList, "New item added: " + valueTxt.value);
						reloadQuickStart();
					});

			});
			reloadQuickStart();
		</script>
	</body>
</html>
```

Well Done!

### 6. Change Notifications
Now let's receive messages.  
We need to tell Subkit to notify us when messages arrive. We do this by adding a callback to the list of messages using the on() method, as shown below:
```
quickstart.on('item_added', function(snapshot) {
  //We'll fill this in later.
});
```
This method takes two arguments: the event type and the callback function. We'll use the 'item_added' event so that we are notified of the arrival of individual messages.

Now you're handling real-time updates!  
With Subkit, you always read data using callbacks. This allows us to guarantee that Subkit applications always update in real-time.
Note that when your app starts, Subkit will call your callback for all existing messages and then continue to call it for any new messages that arrive. There's intentionally no distinction between "initial" data and "new" data. This allows you to write your message handling logic once rather than having to handle these two cases separately.
Tip: In addition to 'item_added' events, Subkit has 4 other event types.  

1. Value ('item_value')
2. Item Added ('item_added')
3. Item Changed ('item_changed')
4. Item Removed ('item_removed')

Now we need to display the messages on the page in real-time.  
For each message, Subkit will call your callback with containing the message's data.
Extract the message data from the by calling the value property and assign it to a variable. Then, call the displayMessage() function to display the message as shown:

```
```

_Congratulations!_  
You've completed the guided portion of this tutorial.  
On the next page you'll be able to run your working app right here in your browser. You'll also be able to edit your application and (if you like) share it with others.


