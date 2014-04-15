INSTALL
---

1. `npm install`
2. `grunt css`
3. `node server.js` || `npm start`
4. `npm install forever -g`

`npm test`
`forever start -p <path to service> <path to service>/server.js`

BASICS
---

* [RESTful JSON API](docs/restful_api.md)
* [Configuration Options](docs/service_config.md)

GETTING STARTED
---

ARCHITECTURE
---

CLOUD (coming soon)
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
X		 	  | Hooks	      | User-defined HTTP callbacks
-		 	  | Validation    | Request validation support
-		 	  | WebSockets    | Web-Socket support for real-time notifications
-		 	  | Authorization | Advanced resource based authorization

MODULES
---
STATUS		  | Feature 	  | Comments
------------- | ------------- | ---------------
X		 	  | JSON Storage  | A JSON key/value store
X		 	  | PubSub		  | Long polling real-time notifications pub/sub and storage changes
X		 	  | Files		  | Binary Up/Download
X		 	  | Templates	  | JSHTML based template engine (more comming soon)
X		 	  | PlugIn 		  | RESTful/Scheduler/Event-Driven server side JavaScript execution engine
X		 	  | Identity  	  | Manage users, groups, devices
X			  | EMail 		  | Send EMails
X			  | Mobile Push   | Mobile push notification to iOS, Android, WP8
X			  | Location      | Location based services
X			  | Statistics    | Usage statistics and monitoring
-			  | MDM       	  | Mobile Device Management support
-			  | Payment   	  | Payment provider support
-			  | Transcoder    | Transcoding images and videos
-			  | S3       	  | Amazon S3 support

SDKS
---
STATUS		  | Feature 		| Comments
------------- | --------------- | ---------------
X		 	  | iOS 			| [Try Subkit iOS](https://github.com/SubKit/try_subkit_ios)
X		 	  | Android			| [Try Subkit Android](https://github.com/SubKit/try_subkit_android)
X		 	  | WP8				| [Try Subkit WP8](https://github.com/SubKit/try_subkit_wp8)
-			  | Xamarin			| 
X		 	  | JavaScript		| 
X			  | PhoneGap/Cordova| 
-			  | NodeJS		    |
-			  | Python		    | 
-			  | Ruby            |
-			  | Java		    | 
-			  | .NET (C#)   	|
-			  | Erlang/Elixir   |
-			  | PowerShell      |
X			  | AngularJS       |

* HTTPS support
* Offline support (coming soon)

PLUGINS
---
STATUS		  | Feature          | Comments
------------- | ---------------- | ---------------
-		 	  | MySQL Connector  | MySQL DB import/export connector
-		 	  | MSSQL Connector  | MSSQL DB import/export connector
-		 	  | HTML scraping    | Download and scrap HTML

GUIDES
---
* RESTFul API rules
* Transactions & Idempotency
* Caching
* Developing Plugin - JavaScript execution engine API
* Using Modules - Use excisting modules
* Developing Modules - Write your own modules
