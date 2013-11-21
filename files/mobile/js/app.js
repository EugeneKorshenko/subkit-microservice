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
	var previous = ["stores"];
	var nav = new Navigation();

	nav.onChanged(function(name){
		if(name === "storage") load();
		if(name === "jsoneditor") $scope.dataObj = JSON.stringify(shared.rawObj, null, 4);
	});

	var obj = [];
	var segments = {};

	var load = function(){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
		var key = previous.join('/');
		$scope.key = key;
		$scope.stores = [];

		var segment = obj[previous[previous.length-1]] || segments[key];

		if(shared.rawObj && segment) {
			segments[key] = segment;
			obj = segment;
			angular.forEach(obj, function(item, key){
				var value = "";
				if(!angular.isObject(item)) value = item;
				$scope.stores.push({key: key, value: value});
			});
		} else {
			subkit.lookup(key, function(err, data){
				if(err) statusCtrl.show("network error");
				
				segments = {};
				obj = data;
				shared.rawObj = angular.isObject(data) ? data : null;

				angular.forEach(data, function(item, key){
					var value = "";
					if(!angular.isObject(item)) value = item;
					$scope.stores.push({key: item.name || item.key || key, value: value});
				});
				$scope.$apply();
			});
		}
	};
	$scope.isJSON= function(){
		return !angular.isArray(shared.rawObj);
	};
	$scope.hasParent = function(){
		return previous.length>1;
	};
	$scope.json = function(){
		nav.go("jsoneditor");
	};
	$scope.edit = function(key){
		console.log("edit");
		console.log(key);
	};
	$scope.save = function(){
		console.log("save");
		console.log($scope.dataObj);
	};
	$scope.next = function(key){
		previous.push(key);
		load();
	};
	$scope.previous = function(){
		previous.pop();
		load();
	};
}]);

var App = {
    init: function () {
        FastClick.attach(document.body);
    }
};

App.init();