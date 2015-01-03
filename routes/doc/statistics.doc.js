'use strict';

module.exports.init = function(doc){

	var statistics_doc = doc('statistics', 'Instance usage statistics operations.');
	statistics_doc.models.Usage = {
		id: 'Usage',
		properties: {
			id: {
				type: 'integer'
			},
			timestamp: {
				type: 'date'
			},
			requestBytes: {
				type: 'integer'
			},
			requestCount: {
				type: 'integer'
			},
			responseBytes: {
				type: 'integer'
			},
			totalBytes: {
				type: 'integer'
			},
			totalKBytes: {
				type: 'integer'
			},
			totalMBytes: {
				type: 'integer'
			},
			totalGBytes: {
				type: 'integer'
			},
			connections: {
				type: 'integer'
			},
			dbSizeBytes: {
				type: 'integer'
			},
			dbSizeKBytes: {
				type: 'integer'
			},
			dbSizeMBytes: {
				type: 'integer'
			},
			dbSizeGBytes: {
				type: 'integer'
			},
			agents:{
				type: 'complex'
			},
			http:{
				type: 'complex'
			},
			urls:{
				type: 'complex'
			}		
		}
	};
	statistics_doc.get('/statistics/summary', 'Get service instance usage analytics.', {
	    nickname: 'getUsageAnalytics',
		responseClass: 'Usage',
		notes:'',
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: 'Error.'
			}
		]
	});
	statistics_doc.get('/statistics/raw', 'Get service instance raw usage analytics.', {
	    nickname: 'getRawUsageAnalytics',
		responseClass: 'Usage',
		notes:'',
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: 'Error.'
			}
		]
	});
	statistics_doc.get('/statistics/minutes', 'Get service instance minute usage analytics.', {
	    nickname: 'getMinuteUsageAnalytics',
		responseClass: 'Usage',
		notes:'',
		parameters: [],
		errorResponses:[
			{
				code: 500,
				message: 'Error.'
			}
		]
	});

};