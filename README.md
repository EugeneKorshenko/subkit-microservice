# Subkit Microservice Platform [![Build Status](https://travis-ci.org/SubKit/subkit-microservice.svg?branch=master)](https://travis-ci.org/SubKit/subkit-microservice)

PREAMBLE
---
ATTENTION! Project is under heavy development and not ready for production yet.


INSTALL
---

via NPM  
`npm install subkit-microservice`  
`npm start`  

Open your browser https://localhost:8080.  
Default Username: subkit  
Default Password: subkit  

via Git  
`git clone https://github.com/SubKit/subkit-microservice.git`  
`cd subkit-microservice`  
`npm install grunt-cli -g`  
`npm install`  
`npm test`  
`npm start`  

Open your browser https://localhost:8080.  
Default Username: subkit  
Default Password: subkit  

SUPERVISOR
---

It's essential to monitor the current execution state to each microservice instance. We use forever to start every instance via the 'supervisor.js' script.

Start a Subkit mirsoservice instance supervised.

1. `npm start` || `node supervisor.js`

BASICS
---
* [Quick Intro](docs/quick_intro.md)
* [Quick Intro JavaScript Sample](docs/quick_start_javascript_sample.html)
* [Configuration Options](docs/service_config.md)
* [URI Style](docs/uri_style.md)
* [Hypermedia Style](docs/hypermedia_style.md)
* [Event Driven Style](docs/eventdriven_style.md)
* [RESTful JSON API](docs/restful_api.md)


GETTING STARTED
---
* [5 mins Subkit JS Tutorial](docs/tutorials/5mins_js_tutorial.md)


ARCHITECTURE
---
* Micro-Services - Autonomous Components
* Reliable, Responsible & Partitioning
* Temporal consistency, Idempotency & Transactions
* Data structure design
* Integration-Points, Composites & Aggregation
* Caching
* Scale-Up & Scale-Down
* Offline & Sync strategies
* Environment, Monitoring & Usages
* Conventions and practice

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
X		 	  | JSON Queries  | [MongoDB like JSON Queries](docs/store_queries.md)
X		 	  | Worker		  | Scheduled Background Worker
X		 	  | Monitoring	  | Heartbeats for Web-Service Monitoring
X		 	  | Statistics	  | Useful statistics and usage analysis
X		 	  | History		  | Track and query all state changes
X		 	  | JSON Storage  | A Lightweight JSON key/value persistence
X		 	  | Message Bus	  | Lightweight Message Bus for Real-Time topic based and storage changes
X			  | Statistics    | Instance resource and usage statistics
-		 	  | WebHooks      | User-defined HTTP callbacks
-		 	  | Hooks         | Request/Response custom code hooks
-		 	  | WebSockets    | Web-Socket support for real-time notifications
-		 	  | Authorization | Advanced resource based authorization

PLUGINS
---

Extend the Subkit mirco service instance with plugins.

`npm install <plugin> --save-optional`

STATUS		  | Name 	 		  | Comments
------------- | ----------------- | ---------------
X		 	  | [File](https://github.com/SubKit/subkit-file-plugin.git)			  | Create, Upload, Download static files
X			  | [EMail](https://github.com/SubKit/subkit-email-plugin.git) 			  | Templated EMails over SMTP 
-			  | [Mobile Push](https://github.com/SubKit/subkit-push-plugin.git)	  | Mobile push notifications to iOS, Android, WP8
X			  | [Task](https://github.com/SubKit/subkit-task-plugin.git)	    	  | Manage, execute and schedule custom JavaScript tasks
-			  | [Geolocation](https://github.com/SubKit/subkit-geolocation-plugin.git)    	  | Organize and query geolocations
-			  | [S3](https://github.com/SubKit/subkit-S3-plugin.git)			  | Manage Amazon S3 buckets and items
X		 	  | [Template](https://github.com/SubKit/subkit-template-plugin.git)		  | JSHTML based template engine
X		 	  | [User](https://github.com/SubKit/subkit-user-plugin.git)			  | Manage accounts
-			  | [Payment](https://github.com/SubKit/subkit-payment-plugin.git)   		  | Payment provider support
O			  | BaaS			  | Manage Subkit as BaaS or MEAP
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
* Rights
* [Queries](docs/store_queries.md)
* Aggregation
* Metadata

DEVELOPMENT
---
* [Custom Plugin Development](docs/plugin_dev.md)
* Develop Tasks - The custom JavaScript execution API

MODULE DOCUMENTATION
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
* [Identity Module](docs/modules/identity.md)

License
---
No License  
Copyright 2014 Mike Bild  
