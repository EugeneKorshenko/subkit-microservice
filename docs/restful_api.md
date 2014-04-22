RESTful API
----

Interactive DOC
---

[Localhost Documentation](https://localhost:8080/doc)

CURL
---

```
curl -X GET -H "api_Key: 6654edc5-82a3-4006-967f-97d5817d7fe2" -G --data-urlencode 'limit=10' --data-urlencode 'where={"$not":{ "value.password":"ofT6IM3I"}}' http://localhost:8080/stores/identities | python -m json.tool
```

API Return Codes
---
Success
--
* 200	Ok - Request was successful.
* 201	Created - Request was successful and resulted in a new resource that has been created instantly.
* 202	Accepted - Request has been accepted for further processing, but the processing itself has not been completed yet.
* 204	No Content - Server performed the request successfully, but does return an entity-body.

Failure
--
* 400	Bad Request - Request does not have a valid format, i.E missing required parameters, etc.
* 401	Unauthorized Access - No valid session available at the time the request was made.
* 404	Not Found - Requested container does not exist.

Error
--
* 500	System Error - A more detailed reason is available through the error message.
