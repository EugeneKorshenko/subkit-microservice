'use strict';

module.exports.init = function(doc){

	var events_doc = doc('events', 'Event operations.');
	events_doc.models.Value = {
		id: 'Value',
		properties: {
		    clientId: {
		    	type: 'string'
		    },
		    channel:{
		    	type: 'string'
		    },
		    data: {
		    }
  		}
	};
	events_doc.models.Info = {
		id: 'Info',
		properties: {
			clientId:{
				type: 'string'
			},
			channel:{
				type: 'string'
			}
		}
	};
	events_doc.get('/events/client/{channel}/{clientId}', 'Receive messages from specified stream and client id.', {
	    nickname: 'receive',
		responseClass: 'List[Value]',
		parameters: [
			{name: 'channel', description: 'channel name', required:true, dataType: 'string', paramType: 'path'},
			{name: 'clientId', description: 'client id', required:true, dataType: 'string', paramType: 'path'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.get('/events/client/{clientId}', 'Receive all messages for client id.', {
	    nickname: 'receiveAll',
		responseClass: 'List[Value]',
		parameters: [
			{name: 'clientId', description: 'client id', required:true, dataType: 'string', paramType: 'path'}
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.post('/events/client/publish/{clientId}', 'Publish message to specified client id.', {
	    nickname: 'publish',
		parameters: [
			{name: 'clientId', description: 'The client Id', required:true, dataType: 'string', paramType: 'path'},
			{name: 'value', description: 'The message data', required:true, dataType: 'Value', paramType: 'body'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.get('/events/clients', 'Get all available clients.', {
	    nickname: 'getClients',
		responseClass: 'List[Info]',
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.get('/events/clients/{channel}', 'Get all clients by channel name.', {
	    nickname: 'getClientsByChannel',
		responseClass: 'List[Info]',
		parameters: [
			{name: 'channel', description: 'Channel name.', required:true, dataType: 'string', paramType: 'path'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.post('/events/channel/publish/{channel}', 'Publish message to specified channel.', {
	    nickname: 'publish',
		parameters: [
			{name: 'channel', description: 'Channel name', required:true, dataType: 'string', paramType: 'path'},
			{name: 'value', description: 'The message data', required:true, dataType: 'Value', paramType: 'body'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.get('/events/channels', 'Get all available channels.', {
	    nickname: 'getChannels',
		responseClass: 'List[Info]',
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.get('/events/channels/{clientId}', 'Get all channels by client Id.', {
	    nickname: 'getChannelsByClientId',
		responseClass: 'List[Info]',
		parameters: [
			{name: 'clientId', description: 'Client Id.', required:true, dataType: 'string', paramType: 'path'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.get('/events/subscribe/{channel}/{clientId}', 'Long-Polling Subscribe to specified channel with a client id.', {
	    nickname: 'subscribe',
		parameters: [
			{name: 'channel', description: 'Channel name', required:true, dataType: 'string', paramType: 'path'},
			{name: 'clientId', description: 'Your client id', required:true, dataType: 'string', paramType: 'path'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});
	events_doc.delete('/events/subscribe/{channel}/{clientId}', 'Unsubscribe from specified channel with a client id.', {
	    nickname: 'unsubscribe',
		parameters: [
			{name: 'channel', description: 'Channel name', required:true, dataType: 'string', paramType: 'path'},
			{name: 'clientId', description: 'Your client id', required:true, dataType: 'string', paramType: 'path'},
		],
		errorResponses:[
			{
				code: 500,
				message: 'Script error.'
			}
		]
	});

};