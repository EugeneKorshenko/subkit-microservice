'use strict';

module.exports.init = function(doc){

	var shares_doc = doc('shares', 'Share operations.');
	shares_doc.models.Share = {
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
	shares_doc.get('/shares/identities', 'List all identities in shares.', {
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
	shares_doc.get('/shares/{identity}', 'List all shares by identity.', {
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
	shares_doc.post('/shares/{name}', 'Add a share.', {
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
	shares_doc.delete('/shares/{name}', 'Remove a share.', {
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
	shares_doc.put('/shares/{name}/action/grantread/{identity}', 'Grant read access.', {
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
	shares_doc.put('/shares/{name}/action/revokeread/{identity}', 'Revoke read access.', {
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
	shares_doc.put('/shares/{name}/action/grantinsert/{identity}', 'Grant write access.', {
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
	shares_doc.put('/shares/{name}/action/revokeinsert/{identity}', 'Revoke write access.', {
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
	shares_doc.put('/shares/{name}/action/grantupdate/{identity}', 'Grant write access.', {
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
	shares_doc.put('/shares/{name}/action/revokeupdate/{identity}', 'Revoke write access.', {
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
	shares_doc.put('/shares/{name}/action/grantdelete/{identity}', 'Grant delete access.', {
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
	shares_doc.put('/shares/{name}/action/revokedelete/{identity}', 'Revoke delete access.', {
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
	shares_doc.put('/shares/action/revoke/:identity', 'Revoke all access.', {
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