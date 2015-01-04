'use strict';

module.exports.init = function(doc){

	var manage_doc = doc('manage', 'Service instance operations.');
	
	manage_doc.models.PasswordChange = {
		id: 'PasswordChange',
		properties: {
			password:{
				type: 'string'
			},
			newPassword:{
				type: 'string'
			},
			newPasswordValidation:{
				type: 'string'
			}
		}
	};
	manage_doc.models.Certificate = {
		id: 'Certificate',
		properties: {
			certificate:{
				type: 'string'
			},
			key:{
				type: 'string'
			}
		}
	};

	manage_doc.post('/manage/login','Signin.',{
		nickname: 'Login',
	    summary: 'Validate username and password.',
	    errorResponses:[
			{
				code: 401,
				message: 'Unauthorized request.'
			}
		]
	});
	manage_doc.get('/manage/os','OS information.',{
		nickname: 'getOSInformation',
	    errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.get('/manage/log/{name}','Read logging and tracing information.',{
		nickname: 'getLogByName',
		responseClass: 'List[Value]',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X GET {BASEURI}/manage/log/{name}',
		parameters: [
	    	{name: 'name', description: 'Name of log (err, out).', required:true, dataType: 'string', paramType: 'path'}
	    ],
	    errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/password/action/reset','Reset admin password.',{
		nickname: 'changePassword',
		parameters: [
			{name: 'PasswordChange', description: 'Password change object.', required:true, dataType: 'PasswordChange', paramType: 'body'}
		],
	    errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/apikey/action/reset','Change API key.',{
		nickname: 'changeAPIKey',
	    errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/certificate/action/change','Change instance certificate.',{
		nickname: 'changeCertificate',
		parameters: [
			{name: 'Certificate', description: 'Password change object.', required:true, dataType: 'Certificate', paramType: 'body'}
		],
	    errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});

	manage_doc.get('/manage/plugins', 'List available plugins.', {
	    nickname: 'listPlugins',
		responseClass: 'List[string]',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X GET {BASEURI}/manage/plugins',
		parameters: [],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});
	manage_doc.put('/manage/plugins/{name}', 'Add a plugin.', {
		nickname: 'addPlugin',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X POST {BASEURI}/manage/plugins/{name}',
		parameters: [
			{name: 'name', description: 'Name of plugin.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});
	manage_doc.delete('/manage/plugins/{name}', 'Remove a plugin.', {
		nickname: 'removePlugin',
		responseClass: 'void',
		note: 'curl -H "accept: application/json" -H "x-auth-token: {APIKEY}" -X DELETE {BASEURI}/manage/plugins/{name}',
		parameters: [
			{name: 'name', description: 'Name of plugin.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Error message'
			}
		]
	});

	manage_doc.models.Share = {
		id: 'Share',
		properties: {
			GET:{
				type: 'List[String]'
			},
			POST:{
				type: 'List[String]'
			},
			PUT:{
				type: 'List[String]'
			},
			DELETE:{
				type: 'List[String]'
			}
		}
	};
	manage_doc.get('/manage/shares/identities', 'List all identities in shares.', {
		nickname: 'readIdentities',
		responseClass: 'List[String]',
		parameters: [],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.get('/manage/shares/{identity}', 'List all shares by identity.', {
		nickname: 'readSharedByIdentity',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'identity', description: 'Name of identity.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.post('/manage/shares/{name}', 'Add a share.', {
		nickname: 'addShare',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'name', description: 'Name of share.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});	
	manage_doc.delete('/manage/shares/{name}', 'Remove a share.', {
		nickname: 'removeShare',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'name', description: 'Name of share.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/shares/{name}/action/grantread/{identity}', 'Grant read access.', {
		nickname: 'grantRead',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'name', description: 'Name of share.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'identity', description: 'Name of identity.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/shares/{name}/action/revokeread/{identity}', 'Revoke read access.', {
		nickname: 'revokeRead',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'name', description: 'Name of share.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'identity', description: 'Name of identity.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/shares/{name}/action/grantinsert/{identity}', 'Grant write access.', {
		nickname: 'grantInsert',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'name', description: 'Name of share.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'identity', description: 'Name of identity.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/shares/{name}/action/revokeinsert/{identity}', 'Revoke write access.', {
		nickname: 'revokeInsert',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'name', description: 'Name of share.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'identity', description: 'Name of identity.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/shares/{name}/action/grantupdate/{identity}', 'Grant write access.', {
		nickname: 'grantUpdate',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'name', description: 'Name of share.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'identity', description: 'Name of identity.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/shares/{name}/action/revokeupdate/{identity}', 'Revoke write access.', {
		nickname: 'revokeUpdate',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'name', description: 'Name of share.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'identity', description: 'Name of identity.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});	
	manage_doc.put('/manage/shares/{name}/action/grantdelete/{identity}', 'Grant delete access.', {
		nickname: 'grantDelete',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'name', description: 'Name of share.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'identity', description: 'Name of identity.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/shares/{name}/action/revokedelete/{identity}', 'Revoke delete access.', {
		nickname: 'revokeDelete',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'name', description: 'Name of share.', required:true, dataType: 'string', paramType: 'path'},
			{name: 'identity', description: 'Name of identity.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});
	manage_doc.put('/manage/shares/action/revoke/:identity', 'Revoke all access.', {
		nickname: 'revokeAll',
		responseClass: 'List[Share]',
		parameters: [
			{name: 'identity', description: 'Name of identity.', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 400,
				message: 'Bad request'
			},
			{
				code: 401,
				message: 'Unauthorized request'
			},
			{
				code: 500,
				message: 'Internal server error'
			}
		]
	});

};