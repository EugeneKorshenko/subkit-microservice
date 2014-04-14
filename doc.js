var swagger = require('swagger-doc');
module.exports.configure = function(server, options){
	swagger.configure(server, options);

	//SUBKIT MANAGEMENT
	var manage_doc = swagger.createResource("/docs/manage", {description: "Service instance management operations."});
	manage_doc.post("/manage/login","Login with username and password.",{
		nickname: "Login",
	    summary: "Validate username and password.",
	    errorResponses:[
			{
				code: 401,
				message: "Unauthorized request."
			}
		]
	});
	manage_doc.put("/manage/change","Change API key.",{
		nickname: "ChangeAPIKey",
	    summary: "Change the current API key to a new uuid.",
	    errorResponses:[
			{
				code: 401,
				message: "Unauthorized request."
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
	stores_doc.get("/stores", "List all stores.", {
		nickname: "ReadStores",
		responseClass: "List[Info]",
		errorResponses:[
			{
				code: 401,
				message: "Unauthorized request."
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
	    errorResponses:[
			{
				code: 400,
				message: "Invalid parameter format."
			},
			{
				code: 401,
				message: "Unauthorized request."
			},
			{
				code: 404,
				message: "Invalid parameter format."
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
		errorResponses:[
			{
				code: 400,
				message: "Invalid parameter format."
			},
			{
				code: 401,
				message: "Unauthorized request."
			},
			{
				code: 404,
				message: "Invalid parameter format."
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
		errorResponses:[
			{
				code: 400,
				message: "Invalid parameter format."
			},
			{
				code: 401,
				message: "Unauthorized request."
			},
			{
				code: 404,
				message: "Invalid parameter format."
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
		errorResponses:[
			{
				code: 400,
				message: "Invalid parameter format."
			},
			{
				code: 401,
				message: "Unauthorized request."
			},
			{
				code: 404,
				message: "Invalid parameter format."
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
    	errorResponses:[
			{
				code: 400,
				message: "Invalid parameter format."
			},
			{
				code: 401,
				message: "Unauthorized request."
			},
			{
				code: 404,
				message: "Invalid parameter format."
			}
		]
	});
	stores_doc.post("/stores/{name}/grant", "Grant public access to a store.", {
		nickname: "Grant",
		responseClass: "void",
		parameters: [
        	{name:"name", description: "Name of store.", required:true, dataType: "string", paramType: "path"}
    	],
    	errorResponses:[
			{
				code: 400,
				message: "Invalid parameter format."
			},
			{
				code: 401,
				message: "Unauthorized request."
			},
			{
				code: 404,
				message: "Invalid parameter format."
			}
		]
	});
	stores_doc.delete("/stores/{name}/grant", "Revoke public access to a store.", {
		nickname: "Revoke",
		responseClass: "void",
	    parameters: [
        	{name:"name", description: "Name of store.", required:true, dataType: "string", paramType: "path"}
    	],
    	errorResponses:[
			{
				code: 400,
				message: "Invalid parameter format."
			},
			{
				code: 401,
				message: "Unauthorized request."
			},
			{
				code: 404,
				message: "Invalid parameter format."
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
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/client/{clientId}", "Receive all messages for client id.", {
	    nickname: "receiveAll",
		responseClass: "List[Value]",
		parameters: [
			{name: "clientId", description: "client id", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.post("/pubsub/client/publish/{clientId}", "Publish message to specified client id.", {
	    nickname: "publish",
		parameters: [
			{name: "clientId", description: "The client Id", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "The message data", required:true, dataType: "Value", paramType: "body"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/clients", "Get all available clients.", {
	    nickname: "getClients",
		responseClass: "List[Info]",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/clients/{channel}", "Get all clients by channel name.", {
	    nickname: "getClientsByChannel",
		responseClass: "List[Info]",
		parameters: [
			{name: "channel", description: "Channel name.", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.post("/pubsub/channel/publish/{channel}", "Publish message to specified channel.", {
	    nickname: "publish",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "The message data", required:true, dataType: "Value", paramType: "body"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/channels", "Get all available channels.", {
	    nickname: "getChannels",
		responseClass: "List[Info]",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/channels/{clientId}", "Get all channels by client Id.", {
	    nickname: "getChannelsByClientId",
		responseClass: "List[Info]",
		parameters: [
			{name: "clientId", description: "Client Id.", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.get("/pubsub/subscribe/{channel}/{clientId}", "Long-Polling Subscribe to specified channel with a client id.", {
	    nickname: "subscribe",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "Your client id", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.post("/pubsub/subscribe/{channel}/{clientId}", "Subscribe to specified channel with a client id.", {
	    nickname: "subscribe",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "Your client id", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	pubsub_doc.delete("/pubsub/subscribe/{channel}/{clientId}", "Unsubscribe from specified channel with a client id.", {
	    nickname: "unsubscribe",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "Your client id", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});

	//STATIC FILES MODULE
	var statics_doc = swagger.createResource("/docs/file",  {description: "Static files distribution operations."});
	statics_doc.models.Value = {
	};
	statics_doc.get("/file", "Receive the list of files.", {
	    nickname: "getFiles",
		responseClass: "List[string]",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	statics_doc.post("/file/upload", "Upload a file.", {
	    nickname: "uploadFile",
		responseClass: "",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	statics_doc.post("/file/upload/{name}", "Upload a file.", {
	    nickname: "uploadFile",
		responseClass: "",
		supportedContentTypes: ["application/octed-stream"],
		parameters: [
			{name: "name", description: "file name", required:true, dataType: "string", paramType: "path"},
			{name: "data", description: "data", required:true, dataType: "string", paramType: "body"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	statics_doc.put("/file/upload/{name}", "Upload a file.", {
	    nickname: "uploadFile",
		responseClass: "",
		supportedContentTypes: ["application/octed-stream"],
		parameters: [
			{name: "name", description: "file name", required:true, dataType: "string", paramType: "path"},
			{name: "data", description: "data", required:true, dataType: "string", paramType: "body"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	statics_doc.get("/file/download/{name}", "Download a file.", {
	    nickname: "downloadFile",
		responseClass: "",
		parameters: [
			{name: "name", description: "file name", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	statics_doc.delete("/file/{name}", "Delete a file.", {
	    nickname: "deleteFile",
		responseClass: "",
		parameters: [
			{name: "name", description: "file name", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});

	//PLUGIN MODULE
	var mr_doc = swagger.createResource("/docs/plugin",  {description: "Run plugin operations"});
	mr_doc.models.Value = {
		id: "Value",
		properties: {}
	};
	mr_doc.get("/plugin/schema", "Load JSON schema for specified store name.", {
	    nickname: "getSchema",
		responseClass: "Value",
		parameters: [
			{name: "store", description: "Store name", required:true, dataType: "string", paramType: "query"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	mr_doc.get("/plugin/{name}", "Execute task script by name.", {
	    nickname: "run",
	    responseClass: "Value",
		parameters: [
			{name: "name", description: "Script name.", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	mr_doc.post("/plugin/{name}", "Execute task script by name.", {
	    nickname: "run",
	    responseClass: "Value",
		parameters: [
			{name: "name", description: "Script name.", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "Item object.", allowMultiple:true, required:true, dataType: "Value", paramType: "body"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});

	//TEMPLATE MODULE
	var template_doc = swagger.createResource("/docs/templates",  {description: "Template engine operations."});
	template_doc.models.Value = {
	};
	template_doc.get("/templates", "Get all templates.", {
	    nickname: "list",
		responseClass: "List[string]",
		notes:"curl https://:hostname/templates",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Script error."
			}
		]
	});
	template_doc.get("/templates/{name}", "Get a rendered template.", {
	    nickname: "renderTemplate",
	    responseClass: "string",
	    notes:'curl https://:hostname/templates/:name',
	    produces:["text/html"],
		parameters: [
			{name: "name", description: "Template name.", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[{
				code: 500,
				message: "Template module error."
			}
		]
	});
	template_doc.get("/templates/download/{name}", "Download a template.", {
	    nickname: "downloadTemplate",
	    responseClass: "string",
	    notes: 'curl -O https://:hostname/templates/download/:name',
	    produces:["text/html"],
		parameters: [
			{name: "name", description: "Download a template by name.", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[{
				code: 500,
				message: "Template module error."
			}
		]
	});
	template_doc.post("/templates/upload/{name}", "Add a template.", {
	    nickname: "addTemplate",
		responseClass: "void",
		notes: 'curl -X POST --data-binary @:filename https://:hostname/templates/upload/:name -H "Content-Type:application/octet-stream"',
		parameters: [
			{name: "name", description: "Template name.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 400,
				message: "Add template failed."
			},
			{
				code: 500,
				message: "Template error."
			}
		]
	});
	template_doc.put("/templates/upload/{name}", "Add a template.", {
	    nickname: "addTemplate",
		responseClass: "void",
		notes: 'curl --upload :filename :hostname/templates/upload/:name <br> curl -X PUT --data-binary @:filename https://:hostname/templates/upload/:name -H "Content-Type:application/octet-stream"',
		parameters: [
			{name: "name", description: "Template name.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 400,
				message: "Add template failed."
			},
			{
				code: 500,
				message: "Template error."
			}
		]
	});
	template_doc.delete("/templates/{name}", "Delete a template.", {
	    nickname: "deleteTemplate",
		responseClass: "void",
		notes: 'curl -X DELETE -i https://:hostname/templates/:name',
		parameters: [
			{name: "name", description: "Template name.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Template error."
			}
		]
	});

	//STATISTICS MODULE
	var statistics_doc = swagger.createResource("/docs/statistics",  {description: "Service statistic operations."});
	statistics_doc.models.Transfer = {
		id: "Transfer",
		properties: {
			count: {
				type: "integer"
			},
			requestBytes: {
				type: "integer"
			},
			responseBytes: {
				type: "integer"
			},
			totalBytes: {
				type: "integer"
			},
			totalKBytes: {
				type: "integer"
			},
			totalMBytes: {
				type: "integer"
			},
			totalGBytes: {
				type: "integer"
			}			
		}
	};
	statistics_doc.models.Usage = {
		id: "Usage",
		properties: {
			timestamp: {
				type: "integer"
			},
			connections: {
				type: "integer"
			},
			dbSizeBytes: {
				type: "integer"
			},
			dbSizeKBytes: {
				type: "integer"
			},
			dbSizeMBytes: {
				type: "integer"
			},
			dbSizeGBytes: {
				type: "integer"
			},
			staticsDirSizeKBytes: {
				type: "integer"
			},
			staticsDirSizeMBytes: {
				type: "integer"
			},
			staticsDirSizeGBytes: {
				type: "integer"
			},
			transfer: {
				$ref: "Transfer"
			}
		}
	};
	statistics_doc.models.Analytic = {
		id: "Analytic",
		properties: {
			agents:{
				type: "complex"
			},
			http:{
				type: "complex"
			},
			urls:{
				type: "complex"
			}
		}
	}
	statistics_doc.get("/statistics/usage", "Get service instance usage summaries.", {
	    nickname: "getUsage",
		responseClass: "Usage",
		notes:"",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});
	statistics_doc.get("/statistics/analytics", "Get service instance request analytics.", {
	    nickname: "getAnalytics",
		responseClass: "Analytic",
		notes:"",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});

	//EMAIL MODULE
	var email_doc = swagger.createResource("/docs/email",  {description: "EMail operations."});
	email_doc.models.SendEMail = {
		id: "EMail",
		properties: {
			recipients:{
				type: "List[string]",
				required: true
			},
			groupid:{
				type: "string"
			},
			templateid:{
				type: "string"
			},
			payload:{
				type: "complex"
			},
			html:{
				type: "string"
			},
			text:{
				type: "string"
			},
			subject:{
				type: "string"
			}
		},
		required: [
			"recipients","groupid","subject"
		]
	};
	email_doc.post("/email/send", "Send a email.", {
	    nickname: "sendEmail",
		responseClass: "void",
		notes: '',
		parameters: [
			{name: "SendEMail", description: "A EMail object.", required:true, dataType: "SendEMail", paramType: "body"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});
	email_doc.put("/email/verify/addess/{id}", "Verify a email address.", {
	    nickname: "verifyEMailAddress",
		responseClass: "void",
		notes: '',
		parameters: [
			{name: "id", description: "EMail address.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});
	email_doc.put("/email/verify/domain/{id}", "Verify a email domain.", {
	    nickname: "verifyEMailDomain",
		responseClass: "void",
		notes: '',
		parameters: [
			{name: "id", description: "Domain name.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});

	//IDENTITY MODULE
	var identity_doc = swagger.createResource("/docs/identity",  {description: "Identity operations."});
	identity_doc.models.Value = {
	};
	identity_doc.get("/identity", "Get all identities.", {
	    nickname: "listIdentities",
		responseClass: "List[string]",
		notes:"",
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});
	identity_doc.get("/identity/{id}", "Get a identity.", {
	    nickname: "getIdentity",
	    responseClass: "string",
	    notes:'',
	    produces:["text/html"],
		parameters: [
			{name: "id", description: "Identity ID.", required:true, dataType: "string", paramType: "path"},
		],
		errorResponses:[{
				code: 500,
				message: "Error."
			}
		]
	});
	identity_doc.post("/identity/{id}", "Add a identity.", {
	    nickname: "addIdentity",
		responseClass: "void",
		notes: '',
		parameters: [
			{name: "id", description: "Identity ID.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});
	identity_doc.put("/identity/{id}", "Update a identity.", {
	    nickname: "updateIdentity",
		responseClass: "void",
		notes: '',
		parameters: [
			{name: "id", description: "Identity ID.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Error."
			}
		]
	});
	identity_doc.delete("/identity/{id}", "Delete a identity.", {
	    nickname: "deleteIdentity",
		responseClass: "void",
		notes: '',
		parameters: [
			{name: "id", description: "Identity ID.", required:true, dataType: "string", paramType: "path"}
		],
		errorResponses:[
			{
				code: 500,
				message: "Template error."
			}
		]
	});
}