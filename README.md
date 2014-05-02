# Subkit Microservice Platform [![Build Status](https://travis-ci.org/SubKit/subkit.svg?branch=master)](https://travis-ci.org/SubKit/subkit)

INSTALL
---

1. `npm install`
2. `npm test`
3. `node index.js` || `npm start`
4. `npm install forever -g`
5. `forever start -p <path to service> <path to service>/index.js`

BASICS
---
* [Quick Intro](docs/quick_intro.md)
* [Quick Intro JavaScript Sample](docs/quick_start_javascript_sample.html)
* [RESTful JSON API](docs/restful_api.md)
* [Configuration Options](docs/service_config.md)
* [Custom Plugin Development](docs/plugin_dev.md)

GETTING STARTED
---

* [5 mins Subkit JS Tutorial](docs/tutorials/5mins_js_tutorial.md)


ARCHITECTURE
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
X		 	  | ETag Versions | ETag / version based concurrency control
X		 	  | API DOC       | Interactive REST documentation
X		 	  | JSON Queries  | Advanced JSON Queries
X		 	  | Worker		  | Scheduled Background Worker
X		 	  | Monitoring	  | Heartbeats for Web-Service Monitoring
X		 	  | Statistics	  | Useful statistics and usage analysis
X		 	  | History		  | Track and query all state changes
X		 	  | WebHooks      | User-defined HTTP callbacks
X		 	  | JSON Storage  | A JSON key/value store
X		 	  | PubSub		  | Real-Time topic based and storage changes Pub/Sub
X			  | Statistics    | Instance resource and usage statistics
-		 	  | Hooks         | Request/Response custom code hooks
-		 	  | WebSockets    | Web-Socket support for real-time notifications
-		 	  | Authorization | Advanced resource based authorization

PLUGINS
---

Extend the Subkit mirco service instance with plugins.

`npm install <plugin> --save-optional`

STATUS		  | Name 	 		  | Comments
------------- | ----------------- | ---------------
X		 	  | [File](https://github.com/SubKit/subkit-file-plugin.git)			  | Binary Up/Download
X			  | [EMail](https://github.com/SubKit/subkit-email-plugin.git) 			  | Organize EMail subscriptions and send EMails 
X			  | [Mobile Push](https://github.com/SubKit/subkit-push-plugin.git)	  | Mobile push notifications to iOS, Android, WP8
X			  | [Task](https://github.com/SubKit/subkit-task-plugin.git)	    	  | Manage, execute and schedule custom JavaScript tasks
X			  | [Geolocation](https://github.com/SubKit/subkit-geolocation-plugin.git)    	  | Organize and query geolocations
X			  | [S3](https://github.com/SubKit/subkit-S3-plugin.git)			  | Manage Amazon S3 buckets and items
X		 	  | [Template](https://github.com/SubKit/subkit-template-plugin.git)		  | JSHTML based template engine
-			  | [Payment](https://github.com/SubKit/subkit-payment-plugin.git)   		  | Payment provider support
-		 	  | [Account](https://github.com/SubKit/subkit-account-plugin.git)			  | Manage accounts
O			  | BaaS			  | Subkit as cloud based BaaS
O			  | ETL				  | Extract-Transform-Load data flow engine
O			  | MDM       		  | Mobile Device Management Plugin
O			  | Analytics   	  | Real-Time event-driven data analytics engine
O			  | Transcoder		  | Transcoding images and videos

X = available  
\- = planed  
O = commercial  

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

ROADMAP
---
* [Roadmap](docs/roadmap.md)

GUIDES
---
* RESTFul API
* Transactions & Idempotency
* Caching
* Develop Tasks - The custom JavaScript execution API

DEVELOPMENT
---
* [Manage Module](docs/modules/manage.md)
* [JSON Key/Value Store Module](docs/modules/store.md)
* [PubSub Module](docs/modules/pubsub.md)
* [Worker Module](docs/modules/worker.md)
* [Template Module](docs/modules/template.md)
* [EventSource Module](docs/modules/eventsource.md)
* [File Module](docs/modules/file.md)
* [Doc Module](docs/modules/doc.md)
* [Utils Module](docs/modules/helper.md)
* [Rights Module](docs/modules/rights.md)
* [Configuration Module](docs/modules/configuration.md)