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

Not syntax
===
{"$not":{"value.FirstName":"John Doe"}}


```
[
    {
        "store": "identities",
        "key": "account!ident1@subkit.io",
        "value": {
            "test": "ident1 test",
            "group": "A1",
            "timestamp": 1400299930654,
            "id": "ident1@subkit.io"
        }
    },
    {
        "store": "identities",
        "key": "account!ident2@subkit.io",
        "value": {
            "test": "ident2 test",
            "group": "A1",
            "timestamp": 1400299930655,
            "id": "ident2@subkit.io"
        }
    },
    {
        "store": "identities",
        "key": "account!ident3@subkit.io",
        "value": {
            "test": "ident3 test",
            "group": "A2",
            "timestamp": 1400299930655,
            "id": "ident3@subkit.io"
        }
    },
    {
        "store": "identities",
        "key": "account!ident4@subkit.io",
        "value": {
            "test": "ident4 test",
            "group": "A2",
            "timestamp": 1400299930655,
            "id": "ident4@subkit.io"
        }
    },
    {
        "store": "identities",
        "key": "account!ident5@subkit.io",
        "value": {
            "test": "ident5 test",
            "group": [
                "A1",
                "X"
            ],
            "timestamp": 1400299930655,
            "id": "ident5@subkit.io"
        }
    }
]
```

Grouping parameter
===
query options with grouping key (dot notation)  
```{ groupingKey: 'value.group' }```

result:  
```
{
    "A1": [
        {
            "store": "identities",
            "key": "account!ident1@subkit.io",
            "value": {
                "test": "ident1 test",
                "group": "A1",
                "timestamp": 1400300072846,
                "id": "ident1@subkit.io"
            }
        },
        {
            "store": "identities",
            "key": "account!ident2@subkit.io",
            "value": {
                "test": "ident2 test",
                "group": "A1",
                "timestamp": 1400300072846,
                "id": "ident2@subkit.io"
            }
        },
        {
            "store": "identities",
            "key": "account!ident5@subkit.io",
            "value": {
                "test": "ident5 test",
                "group": [
                    "A1",
                    "X"
                ],
                "timestamp": 1400300072847,
                "id": "ident5@subkit.io"
            }
        }
    ],
    "A2": [
        {
            "store": "identities",
            "key": "account!ident3@subkit.io",
            "value": {
                "test": "ident3 test",
                "group": "A2",
                "timestamp": 1400300072847,
                "id": "ident3@subkit.io"
            }
        },
        {
            "store": "identities",
            "key": "account!ident4@subkit.io",
            "value": {
                "test": "ident4 test",
                "group": "A2",
                "timestamp": 1400300072847,
                "id": "ident4@subkit.io"
            }
        }
    ],
    "X": [
        {
            "store": "identities",
            "key": "account!ident5@subkit.io",
            "value": {
                "test": "ident5 test",
                "group": [
                    "A1",
                    "X"
                ],
                "timestamp": 1400300072847,
                "id": "ident5@subkit.io"
            }
        }
    ],
    "Z": [
        {
            "store": "identities",
            "key": "account!ident6@subkit.io",
            "value": {
                "group": "Z",
                "timestamp": 1400300072860,
                "id": "ident6@subkit.io"
            }
        }
    ]
}
```

Or syntax
===
```{$or:[{"value.group":'A2'},{"value.group":'Z'}]}```

result:  
```
{
    "A2": [
        {
            "store": "identities",
            "key": "account!ident3@subkit.io",
            "value": {
                "test": "ident3 test",
                "group": "A2",
                "timestamp": 1400300201617,
                "id": "ident3@subkit.io"
            }
        },
        {
            "store": "identities",
            "key": "account!ident4@subkit.io",
            "value": {
                "test": "ident4 test",
                "group": "A2",
                "timestamp": 1400300201617,
                "id": "ident4@subkit.io"
            }
        }
    ],
    "Z": [
        {
            "store": "identities",
            "key": "account!ident6@subkit.io",
            "value": {
                "group": "Z",
                "timestamp": 1400300201629,
                "id": "ident6@subkit.io"
            }
        }
    ]
}
```

And syntax
===
```{$and:[{"value.group":'A2'},{"value.group":'Z'}]}```

result:  
```
{
    "A1": [
        {
            "store": "identities",
            "key": "account!ident5@subkit.io",
            "value": {
                "test": "ident5 test",
                "group": [
                    "A1",
                    "X"
                ],
                "timestamp": 1400300243069,
                "id": "ident5@subkit.io"
            }
        }
    ],
    "X": [
        {
            "store": "identities",
            "key": "account!ident5@subkit.io",
            "value": {
                "test": "ident5 test",
                "group": [
                    "A1",
                    "X"
                ],
                "timestamp": 1400300243069,
                "id": "ident5@subkit.io"
            }
        }
    ]
}
```
