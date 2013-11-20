'use strict';
angular
.module('mobilecenter', ['app', 'subkit'])
.service('shared', function () {
	var _username,
		_password,
		_apiKey,
		_domain,
		_errorMsg;
    return {
        username: _username,
        password: _password,
        domain: _domain,
        apiKey: _apiKey,
        errorMsg: _errorMsg
   };
})
.controller("StatisticsCtrl", ['$scope', function($scope){
	$scope.connections = 0;
	$scope.totalBytes = 0;
}])
.controller("StatusCtrl", ['$scope', 'Navigation', 'shared', function($scope, Navigation, shared){
	var nav = new Navigation();
	this.show = function(errorMsg){
		$scope.error = shared.errorMsg;
		$scope.$apply();
		nav.show();
	};
	this.close = function(){
		$scope.error = "";
		$scope.$apply();
		nav.close();
	}
}])
.controller("LoginCtrl",['$scope', 'angularSubkit', 'Navigation', 'shared', function LoginCtrl($scope, angularSubkit, Navigation, shared) {
	$scope.username = "";
	$scope.password = "";
	$scope.domain = "";
	$scope.error = "";
	var nav = new Navigation();
	$scope.login = function(){
		shared.username = $scope.username || "subkit";
		shared.password = $scope.password || "subkit";
		shared.domain = $scope.domain || "http://localhost:8080";
nav.go("center");
		var subkit = new Subkit({ baseUrl: shared.domain, username: shared.username, password: shared.password });
		subkit.login(function(err, data){
			if(err) { $scope.error = err; $scope.$apply(); return; }
			shared.apiKey = data.apiKey;
			nav.go("center");
		});
	};
}])
.controller("StorageCtrl", ['$scope', 'angularSubkit', 'Navigation', 'shared', function StorageCtrl($scope, angularSubkit, Navigation, shared) {
	var previews = ["stores"];
	var nav = new Navigation();

	nav.onChanged(function(name){
		if(name === "storage") load();
	});
	var obj = [];
	var prop = "";
	
	var load = function(){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		var key = previews.join('/');

		if(obj instanceof Array) {
			subkit.lookup(key, function(err, data){
				if(err) statusCtrl.show("network error");

				obj = data;
				$scope.stores = [];

				angular.forEach(data, function(item, key){
					var value = "";
					if(typeof item !== "object") value = item;
					$scope.stores.push({key: item.name || item.key || key, value: value});
				});
				$scope.$apply();
			});
		} else if(obj instanceof Object) {
			$scope.stores = [];

			var forObjProperty = previews[previews.length-1];
			obj = obj[forObjProperty];

			angular.forEach(obj, function(item, key){
				var value = "";
				if(typeof item !== "object") value = item;
				$scope.stores.push({key: key, value: value});
			});
		}
	};
	$scope.next = function(key){
		previews.push(key);
		load();
	};
	$scope.preview = function(){
		obj = [];
		previews.pop();
		load();
	};
}]);

var App = {
    init: function () {
        FastClick.attach(document.body);
    }
};

App.init();