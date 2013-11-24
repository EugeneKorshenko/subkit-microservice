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
.controller("AccountCtrl", ['$scope','$rootScope', 'Navigation', 'shared', function($scope, $rootScope, Navigation, shared){
	var nav = new Navigation();
	nav.onChanged(function(name){
		if(name === "account") _load();
	});

	function _load(){
		console.log("load Account");
		$scope.domain = shared.domain;
		$scope.username = shared.username;
		$scope.password = shared.password;
		$scope.passwordValidation = "";
		$scope.apiKey = shared.apiKey;
		$scope.$apply();
	};

	$scope.save = function(){
		console.log("save account");
		console.log($scope.username);
		console.log($scope.passwordValidation);
	};
}])
.controller("StatisticsCtrl", ['$scope','$rootScope', 'Navigation', 'shared', function($scope, $rootScope, Navigation, shared){
	var nav = new Navigation();
	nav.onChanged(function(name){
		if(name === "statistics") {
			var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
			subkit.statistics(function(err, data){
				if(err) { $rootScope.error = "network error"; nav.show("notify"); }

				$scope.lastUpdate = data.timestamp;
				$scope.connections = data.connections;
				$scope.requestNumber = data.transfer.count;
				$scope.totalKBytes = data.transfer.totalKBytes;
				$scope.dbSizeKBytes = data.dbSizeKBytes;
				$scope.staticsDirSizeKBytes = data.staticsDirSizeKBytes;
				$scope.$apply();
			});
			subkit.analytics(function(err, data){
				$scope.urls = [];
				for (var property in data.urls) {
				    $scope.urls.push({key: property, value: data.urls[property]});
				}
				$scope.agents = [];
				for (var property in data.agents) {
				    $scope.agents.push({key: property, value: data.agents[property]});
				}
				$scope.transfers = [];
				for (var property in data.http) {
				    $scope.transfers.push({key: property, value: data.http[property]});
				}
				$scope.$apply();
			});
		}
	});
}])
.controller("FilesCtrl", ['$scope','$rootScope', 'Navigation', 'shared', function($scope, $rootScope, Navigation, shared){
	var nav = new Navigation();
	nav.onChanged(function(name){
		if(name === "files") _load();
	});

	function _load(){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.list("statics", function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			$scope.files = data;
			$scope.$apply();
		});
	}

	$scope.show = function(fileName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.download(fileName, "statics", function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			$scope.valueData = data || "";
			$scope.keyData = fileName;
			$scope.$apply();
			nav.go("filepreview");
		});
	};

	$scope.open = function(fileName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.download(fileName, "statics", function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			$scope.valueData = data || "";
			$scope.keyData = fileName;
			$scope.$apply();
			nav.go("fileeditor");
		});
	};
	$scope.save = function(){
        var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		var file = new Blob([$scope.valueData]);
        file.name = $scope.keyData;
        subkit.upload(file, "statics", function(err, data){
        	if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
        	nav.back("files");
        });
	};

	$scope.upload = function(elementId){
		var fileInput = document.getElementById(elementId);
		fileInput.addEventListener('change', function(e) {
			var files = fileInput.files;
			var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
			for (var i = 0; i < files.length; i++) {
				subkit.upload(files[i], "statics", function(err, data){
					_load();
				});
			};
		});
		fileInput.click();
	};

	$scope.remove = function(fileName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.delete(fileName, "statics", function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			_load();
		});
	};

	$scope.create = function(fileName){
        var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		var file = new Blob([]);
        file.name = fileName;
        subkit.upload(file, "statics", function(err, data){
        	if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
        	$scope.fileName = "";
        	_load();
        });
	};
}])
.controller("TasksCtrl", ['$scope','$rootScope', 'Navigation', 'shared', function($scope, $rootScope, Navigation, shared){
	var nav = new Navigation();
	nav.onChanged(function(name){
		if(name === "tasks") _load();
	});

	function _load(){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.list("tasks", function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			$scope.tasks = data;
			$scope.$apply();
		});
	}

	$scope.show = function(fileName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.download(fileName, "tasks", function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			$scope.valueData = data || "";
			$scope.keyData = fileName;
			$scope.$apply();
			nav.go("taskeditor");
		});
	};

	$scope.save = function(){
        var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		var file = new Blob([$scope.valueData]);
        file.name = $scope.keyData;
        subkit.upload(file, "tasks", function(err, data){
        	if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
        });
	};

	$scope.upload = function(elementId){
		var fileInput = document.getElementById(elementId);
		fileInput.addEventListener('change', function(e) {
			var files = fileInput.files;
			var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
			for (var i = 0; i < files.length; i++) {
				subkit.upload(files[i], "tasks", function(err, data){
					_load();
				});
			};
		});
		fileInput.click();
	};

	$scope.remove = function(fileName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.delete(fileName, "tasks", function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			_load();
		});
	};

	$scope.create = function(fileName){
        var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		var file = new Blob([]);
        file.name = fileName;
        subkit.upload(file, "tasks", function(err, data){
        	if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
        	$scope.fileName = "";
        	_load();
        });
	};

	$scope.run = function(taskName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.run(taskName, function(err, data){
			$scope.previewOutput = err ? err.message : JSON.stringify(data, null, 4);
			$scope.$apply();
			nav.go("taskpreview");
		});
	};
}])
.controller("TemplatesCtrl", ['$scope','$rootScope', 'Navigation', 'shared', '$sce', function($scope, $rootScope, Navigation, shared, $sce){
	var nav = new Navigation();
	nav.onChanged(function(name){
		if(name === "templates") _load();
	});

	function _load(){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.list("templates", function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			$scope.templates = data;
			$scope.$apply();
		});
	}

	$scope.show = function(fileName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.download(fileName, "templates", function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			$scope.valueData = data || "";
			$scope.keyData = fileName;
			$scope.$apply();
			nav.go("templateeditor");
		});
	};

	$scope.save = function(){
        var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		var file = new Blob([$scope.valueData]);
        file.name = $scope.keyData;
        subkit.upload(file, "templates", function(err, data){
        	if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
        });
	};

	$scope.upload = function(elementId){
		var fileInput = document.getElementById(elementId);
		fileInput.addEventListener('change', function(e) {
			var files = fileInput.files;
			var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
			for (var i = 0; i < files.length; i++) {
				subkit.upload(files[i], "templates", function(err, data){
					_load();
				});
			};
		});
		fileInput.click();
	};

	$scope.remove = function(fileName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.delete(fileName, "templates", function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			_load();
		});
	};

	$scope.create = function(fileName){
        var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		var file = new Blob([]);
        file.name = fileName;
        subkit.upload(file, "templates", function(err, data){
        	if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
        	$scope.fileName = "";
        	_load();
        });
	};

	$scope.open = function(templateName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.open(templateName, function(err, data){
			if(err) { $rootScope.error = "network error"; nav.show("notify"); return; }
			console.log(data);
			$scope.previewOutput = $sce.trustAsHtml(data) || "";
			$scope.keyData = templateName;
			$scope.$apply();
			nav.go("templatepreview");
		});
	};
}])
.controller("LoginCtrl",['$scope', 'angularSubkit', 'Navigation', 'shared', function LoginCtrl($scope, angularSubkit, Navigation, shared) {
	$scope.username = "";
	$scope.password = "";
	$scope.domain = "";
	$scope.error = "";
	var nav = new Navigation();

	$scope.register = function(){
		$scope.hasEnter = true;
		console.log("Register");
		console.log($scope.newUsername);
		console.log($scope.newPassword);
		var counter = $scope.loading = 5;
		var ref = setInterval(function(){
			$scope.loading = --counter;
			$scope.$apply();
			if(counter === 0) {
				clearInterval(ref);
				nav.back("login");
			}
		}, 1000);
	};

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