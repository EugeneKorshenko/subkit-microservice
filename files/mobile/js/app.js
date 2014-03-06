'use strict';

angular
.module('mobilecenter', ['app', 'subkit', 'jv-NotificationBar'])
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
.controller("LoginCtrl",['$scope', 'angularSubkit', 'Navigation', 'shared', 'NotificationBar', function ($scope, angularSubkit, Navigation, shared, notify) {
	$scope.username = "";
	$scope.password = "";
	$scope.domain = "";
	
	var nav = new Navigation();
		
	$scope.register = function(){
		notify.PostMessage('Registering crashed!', 5000, 'faulty');
		$scope.hasEnter = true;
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
		shared.username = $scope.username;
		shared.password = $scope.password;
		shared.domain = $scope.domain;
		var subkit = new Subkit({ baseUrl: shared.domain, username: shared.username, password: shared.password });
		subkit.login(function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			shared.apiKey = data.apiKey;
			nav.go("center");
		});
	};
}])
.controller("AccountCtrl", ['$scope','$rootScope', 'Navigation', 'shared','NotificationBar', function ($scope, $rootScope, Navigation, shared, notify){
	var nav = new Navigation();
	nav.onChanged(function(name){
		if(name === "account") _load();
	});

	function _load(){
		$scope.domain = shared.domain;
		$scope.username = shared.username;
		$scope.password = shared.password;
		$scope.passwordValidation = "";
		$scope.apiKey = shared.apiKey;
		$scope.$apply();
	};

	$scope.save = function(){
		notify.PostMessage("Data saved successfully.", 6000, "success");
		console.log("save account");
		console.log("$scope.username-> "+$scope.username);
		console.log("$scope.password-> "+$scope.password);
		console.log("$scope.passwordValidation-> "+$scope.passwordValidation);
		console.log("$scope.piName-> "+$scope.piName);
		console.log("$scope.piLastname-> "+$scope.piLastname);
		console.log("$scope.piAddress-> "+$scope.piAddress);
		console.log("$scope.piZip-> "+$scope.piZip);
		console.log("$scope.piCountry-> "+$scope.piCountry);
		console.log("$scope.biName-> "+$scope.biName);
		console.log("$scope.biLastname-> "+$scope.biLastname);
		console.log("$scope.biAddress-> "+$scope.biAddress);
		console.log("$scope.biZip-> "+$scope.biZip);
		console.log("$scope.biCountry-> "+$scope.biCountry)
	};
}])
.controller("StatisticsCtrl", ['$scope','$rootScope', 'Navigation', 'shared', 'NotificationBar', function ($scope, $rootScope, Navigation, shared, notify){
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
.controller("FilesCtrl", ['$scope','$rootScope', 'Navigation', 'shared', '$sce', 'NotificationBar', function ($scope, $rootScope, Navigation, shared, $sce, notify){
	var nav = new Navigation();
	nav.onChanged(function(name){
		if(name === "files") _load();
	});

	function _load(){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.list("statics", function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.files = data;
			$scope.$apply();
		});
	}

	$scope.preview = function(templateName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.open(templateName, "statics", function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.previewOutput = $sce.trustAsHtml(data) || "";
			$scope.keyData = templateName;
			$scope.$apply();
			nav.go("filepreview");
		});
	};

	$scope.open = function(fileName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.download(fileName, "statics", function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
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
        	if(err) return notify.PostMessage(err.message, 5000, 'faulty');
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
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			_load();
		});
	};

	$scope.create = function(fileName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		var file = new Blob([]);
		file.name = fileName;
		subkit.upload(file, "statics", function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.fileName = "";
			_load();
		});
	};
}])
.controller("TasksCtrl", ['$scope','$rootScope', 'Navigation', 'shared', 'NotificationBar', function ($scope, $rootScope, Navigation, shared, notify){
	var nav = new Navigation();
	nav.onChanged(function(name){
		if(name === "tasks") _load();
	});

	function _load(){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.list("plugins", function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.tasks = data;
			$scope.$apply();
		});
	}

	$scope.show = function(fileName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.download(fileName, "plugins", function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
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
        subkit.upload(file, "plugins", function(err, data){
        	if(err) return notify.PostMessage(err.message, 5000, 'faulty');
        });
	};

	$scope.upload = function(elementId){
		var fileInput = document.getElementById(elementId);
		fileInput.addEventListener('change', function(e) {
			var files = fileInput.files;
			var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
			for (var i = 0; i < files.length; i++) {
				subkit.upload(files[i], "plugins", function(err, data){
					_load();
				});
			};
		});
		fileInput.click();
	};

	$scope.remove = function(fileName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.delete(fileName, "plugins", function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			_load();
		});
	};

	$scope.create = function(fileName){
        var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		var file = new Blob([]);
        file.name = fileName;
        subkit.upload(file, "plugins", function(err, data){
        	if(err) return notify.PostMessage(err.message, 5000, 'faulty');
        	$scope.fileName = "";
        	_load();
        });
	};

	$scope.schedule = function(taskName){
		nav.go("scheduletask");
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
.controller("TemplatesCtrl", ['$scope','$rootScope', 'Navigation', 'shared', '$sce', 'NotificationBar', function ($scope, $rootScope, Navigation, shared, $sce, notify){
	var nav = new Navigation();
	nav.onChanged(function(name){
		if(name === "templates") _load();
	});

	function _load(){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.list("templates", function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.templates = data;
			$scope.$apply();
		});
	}

	$scope.show = function(fileName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.download(fileName, "templates", function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
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
        	if(err) return notify.PostMessage(err.message, 5000, 'faulty');
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
			if(err) { $rootScope.error = "network error"; natrv.show("notify"); return; }
			_load();
		});
	};

	$scope.create = function(fileName){
        var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		var file = new Blob([]);
        file.name = fileName;
        subkit.upload(file, "templates", function(err, data){
        	if(err) return notify.PostMessage(err.message, 5000, 'faulty');
        	$scope.fileName = "";
        	_load();
        });
	};

	$scope.preview = function(templateName){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
		subkit.open(templateName, "templates", function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.previewOutput = $sce.trustAsHtml(data) || "";
			$scope.keyData = templateName;
			$scope.$apply();
			nav.go("templatepreview");
		});
	};
}])
.controller("PubSubCtrl",['$scope', '$rootScope', 'angularSubkit', 'Navigation', 'shared', 'NotificationBar', function ($scope, $rootScope, angularSubkit, Navigation, shared, notify) {	
	var nav = new Navigation();
	var subkit = null;
	var subscription = null;

	nav.onChanged(function(name){
		if(name === "pubsub") {
			if(subscription) subscription.off($scope.keyData);
			_load();
		}
	});

	var _load = function(){
		subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
		subkit.channels(function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.channels = data.map(function(itm){
				return itm.channel;
			});
			$scope.$apply();
		});
	};
	
	$scope.open = function(channelName){
		$scope.keyData = channelName;
		nav.go("channeleditor");
	};
	$scope.subscribe = function(channelName){
		$scope.messageLog = [];
		if(subscription) $scope.unsubscribe(channelName);
		$scope.channelStatus = "subscribed";
		subscription = subkit.on(channelName, function(data){
			$scope.messageLog.unshift({timestamp: new Date(), value: JSON.stringify(data,null, 4)});
			$scope.$apply();
		});
	};
	$scope.unsubscribe = function(channelName){
		subscription.off(channelName);
		subscription = null;
		$scope.channelStatus = "unsubscribed";
	};
	$scope.create = function(channelName){
		subkit.push(channelName, {value: "created"}, function(){
			_load();
		});
	};
	$scope.publish = function(channelName, value){
		if(!subscription) $scope.channelStatus = "subscribe to channel please";
		else subscription.push({value: value || new Date()});
	};
}])
.controller("StorageCtrl", ['$scope','$rootScope', 'angularSubkit', 'Navigation', 'shared', 'NotificationBar', function ($scope, $rootScope, angularSubkit, Navigation, shared, notify) {
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
				if(err) return notify.PostMessage(err.message, 5000, 'faulty');

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
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			nav.back("storage");
		});
	};
	$scope.saveValue = function(){
		var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
		subkit.set(shared.rawKey, shared.rawObj, function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
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
					if(err) return notify.PostMessage(err.message, 5000, 'faulty');
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
			subkit.set(shared.rawKey, shared.rawObj, function(err, data){
				if(err) return notify.PostMessage(err.message, 5000, 'faulty');
				_load();
			});
		} else { //delete item from store or delete complete store
			var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
			subkit.remove(key, function(err, data){
				if(err) return notify.PostMessage(err.message, 5000, 'faulty');
				_load();
			});
		}
	};
}])
.controller("IdentityCtrl", ['$scope','$rootScope', 'Navigation', 'shared', 'NotificationBar', function ($scope, $rootScope, Navigation, shared, notify){
	var nav = new Navigation();
	var subkit = null;
	nav.onChanged(function(name){
		if(name === "identity") _loadIdentities();
	});

	var _loadIdentities = $scope.loadIdentities = function(){
		subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
		subkit.identities.users(function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.items = data;
			subkit.identities.groups(null, function(err, data){
				if(err) return notify.PostMessage(err.message, 5000, 'faulty');
				$scope.groups = data;
				$scope.$apply();
			});
		});
	};

	var _loadGroups = $scope.loadGroups = function(){
		subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
		subkit.identities.groups(null, function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.items = data;
			$scope.$apply();
		});
	};

	$scope.create = function(identityId){
		subkit.identities.create(identityId, {}, function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.identityId = "";
			_loadIdentities();
		});
	};

	$scope.open = function(identity){
		$scope.identity = identity.value;
		$scope.groups.forEach(function(itm){
			var index = $scope.identity.groups.filter(function(itm2){ return itm.key===itm2.key});
			if(index.length === 0){
				$scope.identity.groups.push({
					key: itm.key,
					isEMail: itm.isEmail,
					isPushNotify: itm.isPushNotify,
					value: itm.value
				});
			}else{
				$scope.identity.groups[0].value = true;
			}
		});
		nav.go("identityeditor");
	};

	$scope.addToGroup = function(newGroupName){
		var exists = $scope.identity.groups.filter(function(itm){
			return itm.key === newGroupName;
		});
		if(exists.length === 0){
			$scope.identity.groups.push({
				key: newGroupName,
				isEMail: false,
				isPushNotify: false,
				value: true
			});
		} else if(exists[0]){
			exists[0].value = true;
		}
		$scope.newGroupName = "";
	};

	$scope.remove = function(identityId){
		subkit.identities.remove(identityId, function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			_loadIdentities();
		});
	};

	$scope.save = function(identityId){
		$scope.identity.groups = $scope.identity.groups.filter(function(itm){
			return itm.value;
		});
		var changedIdentity = angular.copy($scope.identity);
		changedIdentity.groups.forEach(function(group){
			delete group.value;
		});
		subkit.identities.save($scope.identity.identityId, changedIdentity, function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			nav.back("identity");
		});
	};
}])
.controller("EMailCtrl", ['$scope','$rootScope', 'Navigation', 'shared', '$sce', 'NotificationBar', function ($scope, $rootScope, Navigation, shared, $sce, notify){
	var nav = new Navigation();
	var subkit = null;
	nav.onChanged(function(name){
		if(name === "email") _loadGroups();
	});
	var _loadGroups = $scope.loadGroups = function(){
		subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
		subkit.identities.groups(null, function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.items = data;
			$scope.$apply();
		});
	};

	$scope.preview = function(){
		subkit.open($scope.template, "templates", function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.previewOutput = $sce.trustAsHtml(data) || "";
			$scope.$apply();
			nav.go("emailpreview");
		});
	};
	$scope.open = function(emailgroup){
		$scope.emailgroup = emailgroup;
		subkit.identities.groups($scope.emailgroup.key, function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.items = data;

			subkit.list("templates", function(err, data){
				if(err) return notify.PostMessage(err.message, 5000, 'faulty');
				$scope.templates = data;
				$scope.$apply();
			});
		})
		nav.go("emailgroupeditor");
	};
	$scope.use = function(){
		try{
			$scope.templateData = JSON.parse($scope.templateJson);
			nav.back("emailgroupeditor");
		}catch(error){}
	};
	$scope.send = function(){
		console.log($scope.template);
		console.log($scope.templateData);
		console.log($scope.emailgroup.key);

		subkit.email.send({
			"recipients": ["mike@mikebild.com", "go@subkit.io"],
			"templateid": $scope.template,
			"subject": $scope.subject,
			"data": $scope.templateData
		}, function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			notify.PostMessage("Push message sent.", 5000, 'success');
		});
	};
}])
.controller("PushNotifyCtrl", ['$scope','$rootScope', 'Navigation', 'shared', 'NotificationBar', function ($scope, $rootScope, Navigation, shared, notify){
	var nav = new Navigation();
	var subkit = null;

	$scope.messageAlert = "";
	$scope.messageSound = "";
	$scope.messageBadge = "";
	$scope.messagePayload = "";
	$scope.gcmKey = "";
	$scope.mpnKey = "";

	nav.onChanged(function(name){
		if(name === "pushnotify") _loadGroups();
	});
	var _loadGroups = $scope.loadGroups = function(){
		subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
		subkit.identities.groups(null, function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.items = data;
			$scope.$apply();
		});
	};

	$scope.upload = function(elementId){
		var fileInput = document.getElementById(elementId);
		fileInput.addEventListener('change', function(e) {
			var file = fileInput.files[0];
			subkit.notify.upload(file, function(err, data){
				console.log(err);
				console.log(data);
			});
		});
		fileInput.click();
    };

    $scope.saveSettings = function(){
    	console.log("save push notify settings");
    	var settings = { gcmKey: "", mpnKey: "" };
    	subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
		subkit.notify.save(settings, function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			console.log(err);
			console.log(data);
		});
    };

	$scope.open = function(pushnotifygroup){
		$scope.pushnotifygroup = pushnotifygroup;
		subkit.identities.groups($scope.pushnotifygroup.key, function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			$scope.items = data;
			$scope.$apply();
		})
		nav.go("pushnotifygroupeditor");
	};

	$scope.send = function(){
		console.log($scope.pushnotifygroup);
		var payload = {
			"alert": $scope.messageAlert,
			"sound": $scope.messageSound,
			"badge": $scope.messageBadge,
			"payload": $scope.messagePayload
		};
		console.log(payload);
		subkit.notify.send(payload, function(err, data){
			if(err) return notify.PostMessage(err.message, 5000, 'faulty');
			notify.PostMessage("Push message sent.", 5000, 'success');
		});
	};
}])
.controller("LocationCtrl", ['$scope','$rootScope', 'Navigation', 'shared', 'NotificationBar', function ($scope, $rootScope, Navigation, shared, notify){
	var nav = new Navigation();
	nav.onChanged(function(name){
		if(name === "location") _load();
	});

	function _load(){
		console.log("load location");
		$scope.$apply();
	};

	$scope.save = function(){
		console.log("save location");
	};
}])
.directive('validPassword',function(){
  return{
    require: "ngModel",
    link: function(scope, elm, attrs, ctrl){
		var regex = /^(?!.*(.)\1{3})((?=.*[\d])(?=.*[A-Za-z])|(?=.*[^\w\d\s])(?=.*[A-Za-z])).{7,21}$/;
		var validator = function(value){
			ctrl.$setValidity('validPassword', regex.test(value));
		return value;
      };
	  ctrl.$parsers.unshift(validator);
	  ctrl.$formatters.unshift(validator);
    }
  };
})
.directive('validDomain',function(){
  return{
    require: "ngModel",
    link: function(scope, elm, attrs, ctrl){
		// var regex = /^(:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i;
		var validator = function(value){
			// 	if(value === "http://localhost:8080" || value === "https://localhost:8080" || value === "localhost:8080")
			// 		ctrl.$setValidity('validDomain', true);
			// 	else
			// 		ctrl.$setValidity('validDomain', regex.test(value));
			ctrl.$setValidity('validDomain', true);
			return value;
	    };
	  ctrl.$parsers.unshift(validator);
	  ctrl.$formatters.unshift(validator);
    }
  };
})
.directive('validJson', function(){
  return{
    require: "ngModel",
    link: function(scope, elm, attrs, ctrl){
	    var validator = function(value){
			if (value == angular.undefined) {
				ctrl.$setValidity('validJson', false);
				return value;
			}
			try{
				var a=JSON.parse(value);
				ctrl.$setValidity('validJson',true);
			}catch(e){
				ctrl.$setValidity('validJson', false);
			} finally {
				return value;
			}
      };
	  ctrl.$parsers.unshift(validator);
	  ctrl.$formatters.unshift(validator);
    }
  };
})
.directive("repeatPassword", function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, ctrl) {
            var otherInput = elem.inheritedData("$formController")[attrs.repeatPassword];
            ctrl.$parsers.push(function(value) {
                if(value === otherInput.$viewValue) {
                    ctrl.$setValidity("repeat", true);
                    return value;
                }
                ctrl.$setValidity("repeat", false);
            });

            otherInput.$parsers.push(function(value) {
                ctrl.$setValidity("repeat", value === ctrl.$viewValue);
                return value;
            });
        }
    };
});

angular.module("jv-NotificationBar", [])
.service("NotificationBar", function($timeout, $compile, $rootScope) {
    var domElement;
    this.PostMessage = function(message, timeToLinger, cssToApply) {
        var template = angular.element("<div class=\"notification-message " + (cssToApply || "") +  "\" time=\""+timeToLinger+"\">"+message+"</div>");
        var newScope = $rootScope.$new();
        domElement.append($compile(template)(newScope));
    };
    
    this.RegisterDOM = function(element) {
    	domElement = element;
    };   
})
.directive("notificationBar", function(NotificationBar) {
    return {
        restrict:"C",
        link: function(sc, el) {
            NotificationBar.RegisterDOM(el);
        }
    }
})
.directive("notificationMessage", function($timeout) {
    return {
        restrict:"C",
        transclude:true,
        template: "<a href=\"javascript:void(0)\" ng-click=\"close()\">x</a><div ng-transclude></div>",
        link: function(scope, el, attr) {
            var promiseToEnd,
                promiseToDestroy;
            //ugly hack to get css styling to be interpreted correctly by browser.  Blech!
            $timeout(function() {
            	el.addClass("show");
            }, 1);
            scope.close = function() {
                el.remove();
                scope.$destroy();
            };
            
            function cancelTimeouts() {
                if(promiseToDestroy) {
                    $timeout.cancel(promiseToDestroy);
                    promiseToDestroy = undefined;
                }
                $timeout.cancel(promiseToEnd);
                el.addClass("show");
            }
            
            function startTimeouts() {
            	promiseToEnd = $timeout(function() {
                	el.removeClass("show");
                	promiseToDestroy = $timeout(scope.close, 1010);
            	}, attr.time);
            }
            
            el.bind("mouseenter", cancelTimeouts);
            el.bind("mouseleave", startTimeouts);
            
            startTimeouts();
        }
    };
});


var App = {
    init: function () {
        FastClick.attach(document.body);
    }
};

App.init();
