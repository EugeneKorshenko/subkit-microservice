'use strict';

var path = require("path"),
	fs = require("fs");

module.exports.init = function(identity){
	var AccountGroup = function(groupName){
		return new _group(groupName, "Account");
	};
	var Account = function(accountId, username, password){
		accountId = accountId || randString.generate(8);
		return {
			accountId: accountId,
			timestamp: Date.now(),
			validatedAt: "",
			isActive: false,
			isEnabled: false,
			username: username || accountId,
			password: password || randString.generate(8),
			location: {
				lat: 0,
				lon: 0
			},
			groups: [new Group("default")],
			email: new EMail(),
			devices: []
		};
	};
	return {
		
	}
};