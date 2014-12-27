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

};