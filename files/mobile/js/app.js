'use strict';
angular.module('mobilecenter', ['app', 'subkit'])
.service('shared', function () {
	var _username,
		_password,
		_apiKey,
		_domain;
    return {
        username: _username,
        password: _password,
        domain: _domain,
        apiKey: _apiKey
   };
})
.controller("LoginCtrl",['$scope', 'angularSubkit', 'Navigation', 'shared', function LoginCtrl($scope, angularSubkit, Navigation, shared) {
	$scope.username = "";
	$scope.password = "";
	$scope.domain = "";
	var nav = new Navigation();
	$scope.login = function(){
		shared.username = $scope.username;
		shared.password = $scope.password;
		shared.domain = $scope.domain;

		var subkit = new Subkit({ baseUrl: shared.domain, username: shared.username, password: shared.password });
		subkit.login(function(err, data){
			if(err) return;
			shared.apiKey = data.apiKey;
			nav.go("center");
		});
	};
}])
.controller("StorageCtrl",['$scope', 'angularSubkit', 'shared', function StorageCtrl($scope, angularSubkit, shared) {
	$scope.stores = ["a", "b", "c", "1", "2", "3", "4", "5"];
	var previews = [];
	$scope.next = function(key){
			console.log(shared);
	// var subkit = new Subkit({ baseUrl: "@locals.url", apiKey: "@locals.apiKey" });

		previews.push(key);
		if(key === "a") $scope.stores = ["d", "e", "f"];
		if(key === "d") $scope.stores = ["g", "h", "i"];
		if(key === "g") $scope.stores = ["j", "k", "l"];
	};
	$scope.preview = function(){
			console.log(shared);
	// var subkit = new Subkit({ baseUrl: "@locals.url", apiKey: "@locals.apiKey" });

		var preview = previews.pop();
		if(preview === "a") $scope.stores = ["a", "b", "c"];
		if(preview === "d") $scope.stores = ["d", "e", "f"];
		if(preview === "g") $scope.stores = ["g", "h", "i"];
	};
}]);

var App = {
    init: function () {
        FastClick.attach(document.body);
        var baseUrl = "http://api.qotify.com";
        var qotifyApi = new API({baseUrl: baseUrl});
    }
};

App.init();