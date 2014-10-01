# Subkit Microservice Platform [![Build Status](https://travis-ci.org/SubKit/subkit-microservice.svg?branch=master)](https://travis-ci.org/SubKit/subkit-microservice)

Backend applications as simple and flexible as never before.

PREAMBLE
---
ATTENTION! Project is under heavy development and not ready for production yet.

Prerequisites
---
__OS-X__
* none

__Linux__
* none

__Microsoft Windows Installation__  
* [Python 2.7.3](http://www.python.org/download/releases/2.7.3#download)
* [Microsoft Visual Studio C++ 2012](http://go.microsoft.com/?linkid=9816758)
  
__Windows 7__  
* [Microsoft Windows SDK for Windows 7 and .NET Framework 4](http://www.microsoft.com/download/en/details.aspx?displayLang=en&id=8279)
  
__Windows 8/8.1__  
* [Windows Software Development Kit (SDK) für Windows 8](http://www.microsoft.com/click/services/Redirect2.ashx?CR_EAC=300105886)
* [Windows Software Development Kit (SDK) for Windows 8.1](http://www.microsoft.com/click/services/Redirect2.ashx?CR_EAC=300135395)

Installation
---
__via Subkit-CLI__  
`npm install subkit-microservice -g`  
+ Creates a new backend instance  
`subkit new <appname>`  
+ Start the newly created backend instance  
`subkit start <appname>`
+ Browser automatically opens https://localhost:8080  
__Username: subkit__  
__Password: subkit__  

BASICS
---
* [Quick Intro](docs/quick_intro.md)
* [Quick Intro JavaScript Sample](docs/quick_start_javascript_sample.html)
* [Configuration Options](docs/service_config.md)

GETTING STARTED
---
* [5 mins Subkit JS Tutorial](docs/tutorials/5mins_js_tutorial.md)

DOCUMENTATION
---
* [Shares & Access Control](docs/acl.md)
* [Queries](docs/store_queries.md)
* [Projections](docs/projections.md)
* [Task API](docs/task_api.md)

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
X		 	  | JSON Storage  | Lightweight JSON key/value persistence
X		 	  | Message Bus	  | Lightweight Message Bus for Real-Time topic based and storage changes
X			  | Statistics    | Instance resource and usage statistics
X		 	  | Shares        | Resource and ACL based authorization
-		 	  | WebHooks      | User-defined HTTP callbacks
-		 	  | Hooks         | Request/Response custom code hooks
-		 	  | WebSockets    | Web-Socket support for real-time notifications

PLUGINS
---
Extend the Subkit MircoService instance with plugins.

`npm install <plugin> --save-optional`

STATUS		  | Name 	 		  | Comments
------------- | ----------------- | ---------------
X		 	  | [File](https://github.com/SubKit/subkit-file-plugin.git)			  | Create, Upload, Download static files
X			  | [EMail](https://github.com/SubKit/subkit-email-plugin.git) 			  | Templated EMails over SMTP 
X			  | [Task](https://github.com/SubKit/subkit-task-plugin.git)	    	  | Manage, execute and schedule custom JavaScript tasks
X		 	  | [Template](https://github.com/SubKit/subkit-template-plugin.git)		  | JSHTML based template engine
X		 	  | [User](https://github.com/SubKit/subkit-user-plugin.git)			  | Manage accounts
-			  | [Payment](https://github.com/SubKit/subkit-payment-plugin.git)   		  | Payment provider support
-			  | [Geolocation](https://github.com/SubKit/subkit-geolocation-plugin.git)    	  | Organize and query geolocations
-			  | [S3](https://github.com/SubKit/subkit-S3-plugin.git)			  | Manage Amazon S3 buckets and items
-			  | [Mobile Push](https://github.com/SubKit/subkit-push-plugin.git)	  | Mobile push notifications to iOS, Android, WP8
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

* HTTPS support
* Offline support (coming soon)

ROADMAP
---
* [Roadmap](docs/roadmap.md)

GUIDES
---
* [URI Style](docs/uri_style.md)
* [Hypermedia Style](docs/hypermedia_style.md)
* [Event Driven Style](docs/eventdriven_style.md)
* [RESTful JSON API](docs/restful_api.md)

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
* [Share Module](docs/modules/share.md)
* [Configuration Module](docs/modules/configuration.md)
* [Identity Module](docs/modules/identity.md)

DEVELOPMENT
---
* [Custom Plugin Development](docs/plugin_dev.md)
* Develop Tasks - The custom JavaScript execution API

Alternative installations
---
__via NPM__  
`npm install subkit-microservice`  
`cd node_modules/subkit-microservice`  
`npm start`  

__via Git__  
`git clone https://github.com/SubKit/subkit-microservice.git`  
`cd subkit-microservice`  
`npm install grunt-cli -g`  
`npm install`  
`npm test`  
`npm start`  

SuperVisor
---
It's essential to monitor the current execution state to each microservice instance. We use forever to start every instance via the 'supervisor.js' script.

Start a Subkit mirsoservice instance supervised.

1. `npm start` || `node supervisor.js`

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

License
---
No License  
Copyright 2014 Mike Bild  