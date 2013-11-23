'use strict';
angular
.module('mobilecenter', ['app', 'subkit'])
.service('shared', ['$rootScope', function ($rootScope) {
	var _username,
		_password,
		_apiKey,
		_domain;

	var _EDIT_DATA_ = '_EDIT_DATA_';

    // publish edit data notification
    var editData = function (item) {
        $rootScope.$broadcast(_EDIT_DATA_, {item: item});
    };
    //subscribe to edit data notification
    var onEditData = function($scope, handler) {
        $scope.$on(_EDIT_DATA_, function(event, args) {
           handler(args.item);
        });
    };

    return {
    	editData: editData,
        onEditData: onEditData,
        username: _username,
        password: _password,
        domain: _domain,
        apiKey: _apiKey
   };
}])
.controller("StatisticsCtrl", ['$scope','$rootScope', 'Navigation', 'shared', function($scope, $rootScope, Navigation, shared){
	var nav = new Navigation();
	nav.onChanged(function(name){
		if(name === "statistics") {
			var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
			subkit.statistics(function(err, data){
				if(err) {
					$rootScope.error = "network error";
					nav.show("notify");
				}

				$scope.lastUpdate = data.timestamp;
				$scope.connections = data.connections;
				$scope.requestNumber = data.transfer.count;
				$scope.totalKBytes = data.transfer.totalKBytes;
				$scope.dbSizeKBytes = data.dbSizeKBytes;

				$scope.$apply();
			});
		}
	});
}])
.controller("FilesCtrl", ['$scope','$rootScope', 'Navigation', 'shared', function($scope, $rootScope, Navigation, shared){
	var nav = new Navigation();
	nav.onChanged(function(name){
		if(name === "files") {
			var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
			subkit.list("statics", function(err, data){
				if(err) { $scope.error = err; $scope.$apply(); return; }
				$scope.files = data;
				$scope.$apply();
			});

		}
	});
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
.controller("StorageCtrl", ['$scope','$rootScope', 'angularSubkit', 'Navigation', 'shared', function StorageCtrl($scope, $rootScope, angularSubkit, Navigation, shared) {
	var previous = [];
	var nav = new Navigation();
	var obj = [];
	var segments = {};

	nav.onChanged(function(name){
		if(name === "storage") _load();
	});

	var _load = function(){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
		var key = previous.join('/');
		$scope.key = key;
		$scope.stores = [];

		var segment = (obj && obj[previous[previous.length-1]]) || segments[key];

		if(shared.rawObj && segment) {
			segments[key] = segment;
			obj = segment;
			angular.forEach(obj, function(item, itemKey){
				var value = "";
				if(!angular.isObject(item)) value = item;
				$scope.stores.push({key: itemKey, value: value, dataKey: key+"/"+itemKey});
			});
		} else {
			subkit.get(key, function(err, data){
				if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }

				segments = {};
				obj = data;
				shared.rawObj = angular.isObject(data) ? data : null;
				shared.rawKey = key;

				angular.forEach(data, function(item, itemKey){
					var value = "";
					if(!angular.isObject(item)) value = item;
					$scope.stores.push({key: item.name || item.key || itemKey, value: value, dataKey: key+"/"+(item.name || item.key || itemKey)});
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
		return previous.length !== 0;
	};
	$scope.json = function(){
		$scope.jsonData = JSON.stringify(shared.rawObj, null, 4);
		nav.go("jsoneditor");
	};
	$scope.edit = function(key){
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
		shared.rawObj = JSON.parse($scope.jsonData);
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
		subkit.set(shared.rawKey, shared.rawObj, function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			nav.back("storage");
		});
	};
	$scope.saveValue = function(){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
		subkit.set(shared.rawKey, shared.rawObj, function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			nav.back("storage");
		});
	};
	$scope.create = function(itemName){
		//new new store item key
		if(previous.length <= 1){
			$scope.stores.push({
				dataKey: "/-1",
				key: itemName,
				value: ""
			});
			var newKey = previous.concat(
				$scope.stores
				.filter(function(itm){
					return itm.dataKey === "/-1";
				})
				.map(function(itm){
					return itm.key;
				})
			);
			shared.rawKey = newKey.join('/');
			if(newKey.length === 2){
				var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
				subkit.set(shared.rawKey, {}, function(err, data){
					if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
				});
			}
		}

		if(previous.length > 1){
			$scope.stores.push({
				dataKey: shared.rawKey + "/" + itemName,
				key: itemName,
				value: "-"
			});
			shared.rawObj[itemName] = "";
		}

		$scope.itemName = "";
	};
	$scope.next = function(key){
		previous.push(key);
		_load();
	};
	$scope.previous = function(){
		previous.pop();
		_load();
	};
	$scope.remove = function(key){
		var keys = key.split('/');
		var objectPropertyName = keys[keys.length-1];

		var segPath = key.split('/');
		segPath.pop();
		segPath = segPath.join('/');

		var dataSegment = _search(keys, shared.rawObj, segPath);
		
		//delete property by object
		if(dataSegment !== undefined) {
			delete dataSegment[objectPropertyName];
			var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
			subkit.set(shared.rawKey, {}, function(err, data){
				if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
				_load();
			});
		} else { //delete item from store or delete complete store
			var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
			subkit.remove(key, function(err, data){
				if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
				_load();
			});
		}

	};
}]);

var App = {
    init: function () {
        FastClick.attach(document.body);
    }
};

App.init();