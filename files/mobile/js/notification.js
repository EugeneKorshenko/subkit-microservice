angular
	.module("jv-NotificationBar", [])
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