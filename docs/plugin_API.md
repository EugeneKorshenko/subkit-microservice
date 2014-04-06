Plugins API
---

Server-Side console output
----
```
log("mike task console output");
response(null, {data:"mike task console output"});
```

Server-Side timer
----
```
var c = 0;
interval(function(){
	log(c++);
},1000);
log("started");
var self = this;
log(self);
response(null, "started");
```

Send eMail
----
```
email.send("mike@mikebild.com", "demo1", {}, "test email subject");
```


