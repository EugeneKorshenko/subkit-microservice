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
* 200	Ok - The request has succeeded.
* 201	Created - The request has been fulfilled and resulted in a new resource being created.
* 202	Accepted - The request has been accepted for processing, but the processing has not been completed.
* 204	No Content - The server has fulfilled the request but does not need to return an entity-body.

Failure
--
* 400	Bad Request - Request does not have a valid format, all required parameters, etc.
* 401	Unauthorized Access - No currently valid session available.
* 404	Not Found - Requested container does not exist.

Error
--
* 500	System Error - Specific reason is included in the error message.