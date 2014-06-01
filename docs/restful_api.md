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

### Guideline

#### Resource names

* plural version of a resource names 

```
/resources/:resource
```
e.g.

```
/users/{user_id}
```

#### Actions

* place them under a standard `actions` prefix

```
/resources/:resource/actions/:action
```
e.g.

```
/runs/{run_id}/actions/stop
```

API Return Codes
---
Success
--

* `200`: Request succeeded for a `GET` calls, and for `DELETE` or `PATCH` calls that complete synchronously.
* `201`: Request succeeded for a `POST` call that completes synchronously.
* `202`: Request accepted for a `POST`, `DELETE`, or `PATCH` call that will be processed asynchronously.
* `204`: No response content for server performed the request successfully, but does return an entity-body.
* `206`: Request succeeded on `GET`, but only a partial response (paginate response) returned.

Failure
--
* `400`: Bad Request for request does not have a valid format, i.E missing required parameters, etc.
* `401`: Unauthorized Access for no valid session available at the time the request was made.
* `404`: Resource not found for requested resource does not exist.

Error
--
* 500	System Error - A more detailed reason is available through the error message.
