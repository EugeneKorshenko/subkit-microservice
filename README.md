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
X		 	  | HTTP/HTTPS    |


MODULES
----

STATUS		  | Feature 	  | Comments
------------- | ------------- | ---------------
X		 	  | JSON Storage  |
X		 	  | PubSub		  |
X		 	  | Files		  |
X		 	  | Templates	  |
X		 	  | PlugIn 		  |
X		 	  | Identity  	  |
X			  | EMail 		  |
X			  | Mobile Push   |
X			  | Location      |
X			  | Statistics    |
-			  | Payment   	  |

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


PLUGINS
----

STATUS		  | Feature
------------- | -------------
-		 	  | MySQL Connector

DOC
----
400	Bad Request - Request does not have a valid format, all required parameters, etc.
401	Unauthorized Access - No currently valid session available.
404	Not Found - Requested container does not exist.
500	System Error - Specific reason is included in the error message.
