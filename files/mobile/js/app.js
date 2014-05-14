'use strict';

var mobilecenter = angular
	.module('mobilecenter', ['app', 'subkit', 'jv-NotificationBar'])
	.value('AUTH', {domain: '', apiKey: '', username: '', password: ''})
	.config(function($controllerProvider, $compileProvider, $filterProvider, $provide) {
	  mobilecenter.register = {
	    controller: $controllerProvider.register,
	    directive: $compileProvider.directive,
	    filter: $filterProvider.register,
	    factory: $provide.factory,
	    service: $provide.service
	  };
	})
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
	.controller("MainCtrl",['$scope', 'Navigation', 'shared', 'NotificationBar', function ($scope, Navigation, shared, notify) {
		var nav = new Navigation();
		nav.onChanged(function(name){
			if(name === "center") {
				if($scope.plugins.length !== 0) return;
				$scope.loadPlugins();
			}
		});

		$scope.plugins = [];
		$scope.loadPlugins = function(){
			var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
			subkit.plugin.list(function(error, data){
				$scope.plugins = data.map(function(itm){
					return {
						name: itm.replace('subkit-','').replace('-plugin','').toLowerCase(),
						script: itm,
						template: itm
					};
				});
				$scope.$apply();
			});
		};
		$scope.templateUrl = function(plugin) {
			return plugin.name + '/www/' + plugin.template;
		};
	}])
	.controller("LoginCtrl",['$scope', 'Navigation', 'shared', 'NotificationBar','AUTH', function ($scope, Navigation, shared, notify, AUTH) {
		$scope.username = "";
		$scope.password = "";
		$scope.domain = "";
		
		var nav = new Navigation();

		$scope.login = function(){
			shared.username = $scope.username;
			shared.password = $scope.password;
			shared.domain = document.URL;

			AUTH.username = $scope.username;
			AUTH.password = $scope.password;
			AUTH.domain = document.URL;

			var subkit = new Subkit({ baseUrl: shared.domain, username: shared.username, password: shared.password });
			subkit.manage.login(function(err, data){
				if(err) return notify.PostMessage(err.message, 5000, 'faulty');
				
				shared.apiKey = data.apiKey;
				AUTH.apiKey = data.apiKey;

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
		};
	}])
	.controller("StorageCtrl", ['$scope','$rootScope', 'Navigation', 'shared', 'NotificationBar', function ($scope, $rootScope, Navigation, shared, notify) {
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
				subkit.store().get(key, function(err, data){
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
			subkit.store().set(shared.rawKey, shared.rawObj, function(err, data){
				if(err) return notify.PostMessage(err.message, 5000, 'faulty');
				nav.back("storage");
			});
		};
		$scope.saveValue = function(){
			var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
			subkit.store().set(shared.rawKey, shared.rawObj, function(err, data){
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
					subkit.store().set(shared.rawKey, {}, function(err, data){
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
				subkit.store().set(shared.rawKey, shared.rawObj, function(err, data){
					if(err) return notify.PostMessage(err.message, 5000, 'faulty');
					_load();
				});
			} else { //delete item from store or delete complete store
				var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });	
				subkit.store().remove(key, function(err, data){
					if(err) return notify.PostMessage(err.message, 5000, 'faulty');
					_load();
				});
			}
		};
	}])		
	.controller("PubSubCtrl",['$scope', '$rootScope', 'Navigation', 'shared', 'NotificationBar', function ($scope, $rootScope, Navigation, shared, notify) {	
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
			subkit.pubsub.channels(function(err, data){
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
			subscription = subkit.pubsub.on(channelName, function(error, data){
				var logMsg = JSON.stringify({timestamp: new Date(), value: data}, null, 4);
				$scope.messageLog.unshift(logMsg);
				$scope.$apply();
			});
		};
		$scope.unsubscribe = function(channelName){
			subscription.off(channelName);
			subscription = null;
			$scope.channelStatus = "unsubscribed";
		};
		$scope.create = function(channelName){
			subkit.pubsub.push(channelName, {value: "created"}, function(){
				_load();
			});
		};
		$scope.publish = function(channelName, value){
			if(!subscription) $scope.channelStatus = "subscribe to channel please";
			else subscription.push({value: value || new Date()});
		};
	}])
	.controller("StatisticsCtrl", ['$scope','$rootScope', 'Navigation', 'shared', 'NotificationBar', function ($scope, $rootScope, Navigation, shared, notify){
		var nav = new Navigation();
		nav.onChanged(function(name){
			if(name === "statistics") {
				var subkit = new Subkit({ baseUrl: shared.domain, apiKey: shared.apiKey });
				subkit.statistics.usage(function(err, data){
					if(err) { $rootScope.error = "network error"; nav.show("notify"); }

					$scope.lastUpdate = data.timestamp;
					$scope.connections = data.connections;
					$scope.requestNumber = data.transfer.count;
					$scope.totalKBytes = data.transfer.totalKBytes;
					$scope.dbSizeKBytes = data.dbSizeKBytes;
					$scope.staticsDirSizeKBytes = data.staticsDirSizeKBytes;
					$scope.$apply();
				});
				subkit.statistics.analytics(function(err, data){
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

var App = {
    init: function () {
        FastClick.attach(document.body);
    }
};

App.init();
