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
	var obj = [];
	var segments = {};

	nav.onChanged(function(name){
		console.log(name);
		if(name === "storage") _load();
	});

	var _load = function(){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
		var key = previous.join('/');
		$scope.key = key;
		$scope.stores = [];

		var segment = obj[previous[previous.length-1]] || segments[key];

		if(shared.rawObj && segment) {
			segments[key] = segment;
			obj = segment;
			angular.forEach(obj, function(item, itemKey){
				var value = "";
				if(!angular.isObject(item)) value = item;
				$scope.stores.push({key: itemKey, value: value, dataKey: key+"/"+itemKey});
			});
		} else {
			subkit.lookup(key, function(err, data){
				if(err) statusCtrl.show("network error");
				console.log("load");
				segments = {};
				obj = data;
				shared.rawObj = angular.isObject(data) ? data : null;

				angular.forEach(data, function(item, itemKey){
					var value = "";
					if(!angular.isObject(item)) value = item;
					$scope.stores.push({key: item.name || item.key || itemKey, value: value, dataKey: key+"/"+itemKey});
				});
				$scope.$apply();
			});
		}
	};
	function _search(path, obj, segPath){
		for(var itm in obj){
			var fullPath = [];
			for(var p in path){
				fullPath.push(path[p]);
				if(path[p] === itm){
					if(angular.isObject(obj[itm]) && fullPath.join('/') === segPath){
						return obj[itm];
					} else {
						fullPath.pop();
						if(fullPath.join('/') === segPath) 
							return obj;
					}
					return _search(path, obj[itm], segPath);
				}
			}
		}
	};

	$scope.isJSON= function(){
		return !angular.isArray(shared.rawObj);
	};
	$scope.hasParent = function(){
		return previous.length>1;
	};
	$scope.json = function(){
		$scope.jsonData = JSON.stringify(shared.rawObj, null, 4);
		nav.go("jsoneditor");
	};
	$scope.edit = function(key){
		console.log("EDIT");
		var keys = key.split('/');
		var objectPropertyName = keys[keys.length-1];

		var segPath = key.split('/');
		segPath.pop();
		segPath = segPath.join('/');

		var dataSegment = _search(keys, shared.rawObj, segPath);
		shared.objectValue = dataSegment;
		shared.objectKey = objectPropertyName;

		$scope.valueData = shared.objectValue;
		$scope.keyData = shared.objectKey;

		nav.go("valueeditor");
	};
	$scope.saveJson = function(){
		console.log("save JSON");
		console.log($scope.jsonData);
		shared.rawObj = JSON.parse($scope.jsonData);
		console.log(shared.rawObj);
	};
	$scope.saveValue = function(){
		console.log("save Value");
		console.log(shared.rawObj);
	};
	$scope.next = function(key){
		previous.push(key);
		_load();
	};
	$scope.previous = function(){
		previous.pop();
		_load();
	};
}]);

var App = {
    init: function () {
        FastClick.attach(document.body);
    }
};

App.init();