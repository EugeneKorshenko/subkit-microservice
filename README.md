INSTALL
----

1. `npm install`
2. `grunt css`
3. `node server.js` || `npm start`

`npm test`

`sudo forever start -p <path to service> <path to service>/server.js`


DOC
----
400	Bad Request - Request does not have a valid format, all required parameters, etc.
401	Unauthorized Access - No currently valid session available.
404	Not Found - Requested container does not exist.
500	System Error - Specific reason is included in the error message.
