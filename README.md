INSTALL
---

1. `npm install`
2. `npm test`
3. `node server.js` || `npm start`
4. `npm install forever -g`
5. `forever start -p <path to service> <path to service>/server.js`

BASICS
---

* [RESTful JSON API](docs/restful_api.md)
* [Configuration Options](docs/service_config.md)
* [Custom Plugin Development](docs/plugin_dev.md)

GETTING STARTED
---

ARCHITECTURE
---

Mobile Backend as a Service (MBaaS)
---

FEATURES
---

STATUS		  | Feature 	  | Comments
------------- | ------------- | ---------------
X		 	  | HTTP/HTTPS    | [Service Configuration](docs/service_config.md)
X		 	  | Dashboard     | Web-Admin-Dashboard
X		 	  | Backups	      | Backup and Restore your data
X		 	  | JSON Im/Export| JSON data import and export
X		 	  | ETag Caching  | ETag based content caching
X		 	  | API DOC       | Interactive REST documentation
X		 	  | JSON Queries  | Advanced JSON Queries
X		 	  | Worker		  | Scheduled Background Worker
X		 	  | Mointoring	  | Heartbeats for Web-Service Monitoring
X		 	  | Statistics	  | Useful statistics and usage analysis
X		 	  | History		  | Track and query all state changes
X		 	  | WebHooks      | User-defined HTTP callbacks
X		 	  | JSON Storage  | A JSON key/value store
X		 	  | PubSub		  | Real-Time topic based and storage changes Pub/Sub
X		 	  | Tasks 		  | RESTful/Scheduler/Event-Driven server side JavaScript execution engine
X		 	  | Identity  	  | Manage N:M relations like groups to identities and visa vis
X			  | Statistics    | Usage statistics and monitoring
-		 	  | Hooks         | Request/Response custom code hooks
-		 	  | WebSockets    | Web-Socket support for real-time notifications
-		 	  | Authorization | Advanced resource based authorization

PLUGINS
---

Extend the Subkit mirco service instance by installing plugins.

`npm install <plugin> --save-optional`


STATUS		  | Name 	 		  | Comments
------------- | ----------------- | ---------------
X		 	  | Files			  | Binary Up/Download
X			  | Analytics   	  | Event-Source data analytics engine
X		 	  | Templates		  | JSHTML based template engine (more comming soon)
X			  | EMail 			  | Organize EMail subscriptions and send EMails 
X			  | Mobile Push 	  | Mobile push notification to iOS, Android, WP8
X			  | Location    	  | Organize and query Geolocations
X			  | Proxy	    	  | A HTTP(S) request proxy
X			  | Environment	   	  | Host environment statistics and moinoring like CPU and Memory usage
-			  | MDM       		  | [Mobile Device Management Plugin](https://www.npmjs.org/package/subkit-mdm-plugin)
-			  | Shell      		  | [Shell Plugin](https://www.npmjs.org/package/subkit-shell-plugin)
-			  | Payment   		  | Payment provider support
-			  | Transcoder		  | Transcoding images and videos
-			  | AWS S3			  | [Amazon S3 Plugin](https://www.npmjs.org/package/subkit-s3-plugin)
-		 	  | MySQL connector   | MySQL DB import/export connector
-		 	  | MSSQL Connector   | MSSQL DB import/export connector
-		 	  | HTML scraping     | Scraping HTML


SDKS
---
* HTTPS support
* Offline support (coming soon)

STATUS		  | Feature 		| Comments
------------- | --------------- | ---------------
X		 	  | iOS 			| [Try Subkit iOS](https://github.com/SubKit/try_subkit_ios)
X		 	  | Android			| [Try Subkit Android](https://github.com/SubKit/try_subkit_android)
X		 	  | WP8				| [Try Subkit WP8](https://github.com/SubKit/try_subkit_wp8)
-			  | Xamarin			| 
X		 	  | JavaScript		| included
X			  | PhoneGap/Cordova| 
-			  | NodeJS		    |
-			  | Python		    | 
-			  | Ruby            |
-			  | Java		    | 
-			  | .NET (C#)   	|
-			  | Erlang/Elixir   |
-			  | PowerShell      |
X			  | AngularJS       | included

GUIDES
---
* RESTFul API
* Transactions & Idempotency
* Caching
* Develop Tasks - The custom JavaScript execution API
