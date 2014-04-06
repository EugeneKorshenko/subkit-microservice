var swagger = require('swagger-doc');
module.exports.configure = function(server, options){
	swagger.configure(server, options);

	//SUBKIT MANAGEMENT
	var manage_doc = swagger.createResource("/docs/manage", {description: "Manage operation"});
	manage_doc.description = "Management operation";
	manage_doc.post("/manage/login","Login with username and password.",{
		nickname: "Login",
	    summary: "Validate username and password.",
	    "errorResponses":[
			{
				"code": 401,
				"reason": "Unauthorized request."
			}
		]
	});
	manage_doc.put("/manage/change","Change API key.",{
		nickname: "ChangeAPIKey",
	    summary: "Change the current API key to a new uuid.",
	    "errorResponses":[
			{
				"code": 401,
				"reason": "Unauthorized request."
			}
		]
	});

	//PLUGIN MODULE
	var mr_doc = swagger.createResource("/docs/job",  {description: "Run task operations"});
	mr_doc.models.Value = {
		id: "Value",
		properties: {}
	};
	mr_doc.get("/job/schema", "Load JSON schema for specified store name.", {
	    nickname: "getSchema",
		responseClass: "Value",
		parameters: [
			{name: "store", description: "Store name", required:true, dataType: "string", paramType: "query"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	mr_doc.get("/job/{name}", "Execute task script by name.", {
	    nickname: "run",
	    responseClass: "Value",
		parameters: [
			{name: "name", description: "Script name.", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	mr_doc.post("/job/{name}", "Execute task script by name.", {
	    nickname: "run",
	    responseClass: "Value",
		parameters: [
			{name: "name", description: "Script name.", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "Item object.", allowMultiple:true, required:true, dataType: "Value", paramType: "body"}
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	
	//STORE MODULE
	var stores_doc = swagger.createResource("/docs/stores",  {description: "Store operations."});
	stores_doc.models.Value = {
		id: "Value",
		properties: {}
	};
	stores_doc.models.Info = {
		id: "Info",
		properties: {
			grant:{
				type: "bool"
			},
			name:{
				type: "string"
			}
		}
	};
	stores_doc.get("/stores", "Gets all stores", {
		nickname: "ReadStores",
		responseClass: "List[Info]",
		"errorResponses":[
			{
				"code": 401,
				"reason": "Unauthorized request."
			}
		]
	});
	stores_doc.get("/stores/{name}", "Read all items by store name.", {
	    nickname: "FindAll",
		responseClass: "List[Value]",
	    parameters: [
	    	{name: "name", description: "Start letters of name of store.", required:true, dataType: "string", paramType: "path"},
	    	{name: "keysOnly", description: "Only get the keys.(default: false)", required:false, dataType: "boolean", paramType: "query"},
	    	{name: "cache", description: "Disable storage level caching. (default: true)", required:false, dataType: "boolean", paramType: "query"},
			{name: "from", description: "Start from a specified item key. (default:'')", required:false, dataType: "string", paramType: "query"},
			{name: "limit", description: "Limit results within numeric number. (default: -1)", required:false, dataType: "int", paramType: "query"},
	    ],
	    "errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});
	stores_doc.get("/stores/{name}/{key}", "Gets an item in store.", {
	    nickname: "Find",
		responseClass: "Value",
		parameters: [
			{name: "name", description: "Name of store.", required:true, dataType: "string", paramType: "path"},
			{name: "key", description: "Item key.", required:true, dataType: "string", paramType: "path"}
		],
		"errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});
	stores_doc.post('/stores/{name}/{key}', "Create an item in store.", {
		nickname: "Create",
		responseClass: "void",
		parameters: [
			{name: "name", description: "Name of store.", required:true, dataType: "string", paramType: "path"},
			{name: "key", description: "Item key.", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "Item object.", required:true, dataType: "Value", paramType: "body"}
		],
		"errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});
	stores_doc.put('/stores/{name}/{key}', "Update an item in store.", {
		nickname: "Update",
		responseClass: "void",
		parameters: [
			{name: "name", description: "Name of store.", required:true, dataType: "string", paramType: "path"},
			{name: "key", description: "Item key.", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "Item object.", required:true, dataType: "Value", paramType: "body"}
		],
		"errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});
	stores_doc.delete('/stores/{name}/{key}', "Delete an item in store.", {
		nickname: "Delete",
		responseClass: "void",
		parameters: [
			{name: "name", description: "Name of store.", required:true, dataType: "string", paramType: "path"},
			{name: "key", description: "Item key.", required:true, dataType: "string", paramType: "path"}
			
		],
    	"errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});
	stores_doc.post("/stores/{name}/grant", "Grant public access to a store.", {
		nickname: "Grant",
		responseClass: "void",
		parameters: [
        	{name:"name", description: "Name of store.", required:true, dataType: "string", paramType: "path"}
    	],
    	"errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});
	stores_doc.delete("/stores/{name}/grant", "Revoke public access to a store.", {
		nickname: "Revoke",
		responseClass: "void",
	    parameters: [
        	{name:"name", description: "Name of store.", required:true, dataType: "string", paramType: "path"}
    	],
    	"errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});

	//PUBSUB MODULE
	var pubsub_doc = swagger.createResource("/docs/pubsub",  {description: "PubSub operations."});
	pubsub_doc.models.Value = {
		id: "Value",
		properties: {
		    clientId: {
		    	type: "string"
		    },
		    channel:{
		    	type: "string"
		    },
		    data: {
		    }
  		}
	};
	pubsub_doc.models.Info = {
		id: "Info",
		properties: {
			clientId:{
				type: "string"
			},
			channel:{
				type: "string"
			}
		}
	};
	pubsub_doc.get("/pubsub/client/{channel}/{clientId}", "Receive messages from specified stream and client id.", {
	    nickname: "receive",
		responseClass: "List[Value]",
		parameters: [
			{name: "channel", description: "channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "client id", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/client/{clientId}", "Receive all messages for client id.", {
	    nickname: "receiveAll",
		responseClass: "List[Value]",
		parameters: [
			{name: "clientId", description: "client id", required:true, dataType: "string", paramType: "path"}
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	pubsub_doc.post("/pubsub/client/publish/{clientId}", "Publish message to specified client id.", {
	    nickname: "publish",
		parameters: [
			{name: "clientId", description: "The client Id", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "The message data", required:true, dataType: "Value", paramType: "body"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/clients", "Get all available clients.", {
	    nickname: "getClients",
		responseClass: "List[Info]",
		parameters: [],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/clients/{channel}", "Get all clients by channel name.", {
	    nickname: "getClientsByChannel",
		responseClass: "List[Info]",
		parameters: [
			{name: "channel", description: "Channel name.", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	pubsub_doc.post("/pubsub/channel/publish/{channel}", "Publish message to specified channel.", {
	    nickname: "publish",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "The message data", required:true, dataType: "Value", paramType: "body"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/channels", "Get all available channels.", {
	    nickname: "getChannels",
		responseClass: "List[Info]",
		parameters: [],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/channels/{clientId}", "Get all channels by client Id.", {
	    nickname: "getChannelsByClientId",
		responseClass: "List[Info]",
		parameters: [
			{name: "clientId", description: "Client Id.", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/subscribe/{channel}/{clientId}", "Long-Polling Subscribe to specified channel with a client id.", {
	    nickname: "subscribe",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "Your client id", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	pubsub_doc.post("/pubsub/subscribe/{channel}/{clientId}", "Subscribe to specified channel with a client id.", {
	    nickname: "subscribe",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "Your client id", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	pubsub_doc.delete("/pubsub/subscribe/{channel}/{clientId}", "Unsubscribe from specified channel with a client id.", {
	    nickname: "unsubscribe",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "Your client id", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});

	//STATIC FILES MODULE
	var statics_doc = swagger.createResource("/docs/statics",  {description: "Files distribution."});
	statics_doc.models.Value = {
	};
	statics_doc.get("/statics", "Receive a list of files.", {
	    nickname: "getFiles",
		responseClass: "List[string]",
		parameters: [],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	statics_doc.post("/statics/upload", "upload a file", {
	    nickname: "uploadFile",
		responseClass: "",
		parameters: [],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	statics_doc.post("/statics/upload/{name}", "upload a file", {
	    nickname: "uploadFile",
		responseClass: "",
		supportedContentTypes: ["application/octed-stream"],
		parameters: [
			{name: "name", description: "file name", required:true, dataType: "string", paramType: "path"},
			{name: "data", description: "data", required:true, dataType: "string", paramType: "body"}
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	statics_doc.put("/statics/upload/{name}", "upload a file", {
	    nickname: "uploadFile",
		responseClass: "",
		supportedContentTypes: ["application/octed-stream"],
		parameters: [
			{name: "name", description: "file name", required:true, dataType: "string", paramType: "path"},
			{name: "data", description: "data", required:true, dataType: "string", paramType: "body"}
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	statics_doc.get("/statics/download/{name}", "download a file", {
	    nickname: "downloadFile",
		responseClass: "",
		parameters: [
			{name: "name", description: "file name", required:true, dataType: "string", paramType: "path"}
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	statics_doc.delete("/statics/{name}", "delete a file", {
	    nickname: "deleteFile",
		responseClass: "",
		parameters: [
			{name: "name", description: "file name", required:true, dataType: "string", paramType: "path"}
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
}