INSTALL
----

1. `npm install`
2. `grunt css`
3. `node server.js` || `npm start`

`npm test`

`sudo forever start -p <path to service> <path to service>/server.js`


FEATURES
----

STATUS		  | Feature 	  | Comments
------------- | ------------- | ---------------
X		 	  | HTTP/HTTPS    | [Service Configuration](service_config.md)
X		 	  | Dashboard     |
X		 	  | Hooks	      | 
X		 	  | Backups	      | 
X		 	  | JSON Im/Export| 
X		 	  | ETag Caching  |
-		 	  | Validation    | Request validation support
-		 	  | WebSockets    |
-		 	  | JSON Queries  | Advanced JSON Queries
-		 	  | Authorization | Advanced resource based authorization


MODULES
----

STATUS		  | Feature 	  | Comments
------------- | ------------- | ---------------
X		 	  | JSON Storage  | A JSON key/value store
X		 	  | PubSub		  | Long polling real-time notifications pub/sub + storage changes
X		 	  | Files		  | Binary Up/Download
X		 	  | Templates	  | JSHTML based template engine (more comming soon)
X		 	  | PlugIn 		  | RESTful/Scheduler/Event-Driven server side JavaScript execution engine
X		 	  | Identity  	  | Manage users, groups, devices
X			  | EMail 		  | Send EMails
X			  | Mobile Push   | Mobile push notification to iOS, Android, WP8
X			  | Location      | Location based services
X			  | Statistics    | Usage statistics and monitoring
-			  | Graph Storage | A graph store
-			  | Payment   	  | Payment provider support
-			  | Transcoder    | Transcoding images and videos
-			  | S3       	  | Amazon S3 support

SDKS
----

STATUS		  | Feature 		| Comments
------------- | --------------- | ---------------
X		 	  | iOS 			| [Try Subkit iOS](https://github.com/SubKit/try_subkit_ios)
X		 	  | Android			| [Try Subkit Android](https://github.com/SubKit/try_subkit_android)
X		 	  | WP8				| [Try Subkit WP8](https://github.com/SubKit/try_subkit_wp8)
-			  | Xamarin			| 
-		 	  | JavaScript		| 
-			  | PhoneGap/Cordova| 
-			  | NodeJS		    |
-			  | Python		    | 
-			  | Ruby            |
-			  | Java		    | 
-			  | .NET (C#)   	|
-			  | Erlang/Elixir   |
-			  | PowerShell      |
X			  | AngularJS       |


PLUGINS
----

STATUS		  | Feature          | Comments
------------- | ---------------- | ---------------
-		 	  | MySQL Connector  | MySQL DB import/export connector
-		 	  | MSSQL Connector  | MSSQL DB import/export connector
-		 	  | HTML scraping    | Download and scrap HTML

DOC
----
400	Bad Request - Request does not have a valid format, all required parameters, etc.
401	Unauthorized Access - No currently valid session available.
404	Not Found - Requested container does not exist.
500	System Error - Specific reason is included in the error message.
