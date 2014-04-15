Query-Filter 
====

A JSON query language with MongoDB Syntax.

Samples
===

```
curl -X GET -H "api_Key: 6654edc5-82a3-4006-967f-97d5817d7fe2" -G --data-urlencode 'limit=10' --data-urlencode 'where={"value.metadata.Type":"MPNS"}' http://localhost:8080/stores/identities | python -m json.tool

curl -X GET -H "api_Key: 6654edc5-82a3-4006-967f-97d5817d7fe2" -G --data-urlencode 'limit=10' --data-urlencode 'where={"$not":{ "value.password":"ofT6IM3I"}}' http://localhost:8080/stores/identities | python -m json.tool
```

Query parameter
===
```?where={"value.FirstName":"John Doe"}```

Accessing properties
===
```{"FirstName":"John Doe"}```

Accessing properties (dot notation)
===
```{"value.FirstName":"John Doe"}```

Array accessors
===

Array filter
===

Or syntax
===

Not syntax
===
{"$not":{"value.FirstName":"John Doe"}}


