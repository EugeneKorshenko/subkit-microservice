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
_subkit_ now references your Subkit data at https://try.subkit.io/. While _quickstart_ is now referencing your Subkit's data store named "quickstart".
A core concept of Subkit is that every piece of data has its very own URL. You can use this URL to access your data in several ways:
* From any Subkit client library
* From our [REST API](https://try.subkit.io/doc)
* By typing the URL directly into any browser's addressbar (Try it and click the [link](https://try.subkit.io/store/quickstart) above).

### 3. Writing Data
Let's send a message now. 
You can use the Subkit reference you have just created to write data to Subkit by simply using the set() function.
To make things easy, we've already added input text boxes for the chatter's name and message as well as a keypress handler that will fire whenever someone tries to send a message.


For this step, write a message to Subkit by using the set() function as shown here:
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
Subkit supports numbers, booleans and string data types — as well as simple JavaScript objects.

Subkit can handle objects of arbitrary complexity. If it can be represented as JSON, it can be stored in Subkit.
When objects are written to Subkit, the structure of the object is mapped to Subkit locations. In this example here, when the object {title: valueTxt.value, text: 'Subkit 5 mins tutorial.'} is set, locations for name and text are automatically created as children of the location referenced by _quickstart_.

### 5. Reading Data
Let's try to get some data from Subkit and display messages on a page, shall we? 

The specific Subkit response for the 'quickstart' store is an array of items. So first you need to extract the data from the response by calling the value property and assign its payload to a variable in our code. Then, call the reloadQuickStart() function to display the message as shown below:

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
Now, let's receive messages.  
We need to tell Subkit to notify us when messages arrive. We do this by adding a callback to the list of messages by using the on() method, as shown below:
```
quickstart.on('item_added', function(snapshot) {
  //We'll complete this later.
});
```
This method takes two arguments: the event type and the callback function. We'll use the 'item_added' event so that we are getting notified the moment individual messages arrive.

Now you're handling real-time updates! Great stuff, eh?

With Subkit, you always read data by using callbacks. This allows us to guarantee that Subkit applications can always update in real-time.
Note that when your app starts, Subkit will call your callback for all existing messages and then continues to call it for any new message that arrives. There's intentionally no distinction between "initial" data and "new" data. This allows you to write your message handling logic only once instead of having to handle these two cases separately.

Hint: In addition to 'item_added' events, Subkit offers 4 other event types:  

1. Value ('item_value')
2. Item Added ('item_added')
3. Item Changed ('item_changed')
4. Item Removed ('item_removed')

Now we need to display the messages on the page in real-time. 

For each message, Subkit will call your callback and forwards the message's actual data.
To do this, you need to extract the message data from the response by calling the value property and assign it to a variable as learned earlier. Then simply call the displayMessage() function to display the message as shown here:

```
```

_Congratulations!_  
You've completed the guided portion of this tutorial!  
On the next page you'll be able to run your working app right here in your browser. You'll also be able to edit your application and (if you like) share it with others.

