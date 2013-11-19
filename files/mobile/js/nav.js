'use strict';
var slideOpts = {
    sl:     ['slin',   'slout' ],    
    sr:     ['srin',   'srout' ],    
    popin:  ['popin',  'noanim'],    
    popout: ['noanim', 'popout'],    
};
var Slide = function (slideType, vin, vout, callback) {
    var vIn = document.getElementById(vin),
        vOut = document.getElementById(vout),
        onAnimationEnd = function () {
            vOut.classList.add('hidden');
            vIn.classList.remove(slideOpts[slideType][0]);
            vOut.classList.remove(slideOpts[slideType][1]);
            vOut.removeEventListener('webkitAnimationEnd', onAnimationEnd, false);
            vOut.removeEventListener('animationend',       onAnimationEnd);
        };
    vOut.addEventListener('webkitAnimationEnd', onAnimationEnd, false);
    vOut.addEventListener('animationend',       onAnimationEnd);
    if (callback && typeof(callback) === 'function') {
        callback();
    }
    vIn.classList.remove('hidden');
    vIn.classList.add(slideOpts[slideType][0]);
    vOut.classList.add(slideOpts[slideType][1]);
};

var app = angular.module('app', ['ngSanitize'])
    .directive('views', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope:{},
            controller: function($rootScope) {
                var views = $rootScope.views = {},
                    lasts = [],
                    current = "";
                $rootScope.go = function(name) {
                    Slide('sl', name, current);
                    lasts.push(current);
                    current = name;
                };
                $rootScope.back = function(name) {
                    if(name === "undefined") name = lasts.pop();
                    Slide('sr', name, current);
                    current = name;
                };
                this.addView = function(name, view) {
                    view.name = name;
                    views[name] = view;
                    if(Object.keys(views).length===1) current = name;
                };
              },
            template: '<div ng-transclude></div>'
        };
    })
    .directive('view', function() {
        return {
          require: '^views',
          restrict: 'E',
          transclude: true,
          scope:{},
          link: function(scope, element, attrs, viewsCtrl) {
            viewsCtrl.addView(attrs.content, scope);
          },
          template: function(element, attrs){
            var backTarget = attrs.back || undefined,
                backText = attrs.backtext,
                nextTarget = attrs.next,
                nextText = attrs.nexttext || "&nbsp;",
                headerText = attrs.headertext || "&nbsp;",
                nextElement = "",
                backElement = "";

            element[0].id = attrs.content;
            if(backText) backElement = '<back data-view="'+backTarget+'" class="left">'+backText+'</back>';
            if(nextText) nextElement = '<go data-view="'+nextTarget+'" class="right">'+nextText+'</go>';
            return '<section><header><h1>'+headerText+'</h1>'+backElement+nextElement+'</header><div class="scrollMask"></div><div class="scrollWrap"><div class="scroll"><div class="content center" data-ng-transclude></div></div></div></section>';
          }
        };
    })
    .directive('go', function($rootScope) {
        return {
          restrict: 'E',
          replace: true,
          link: function(scope, element, attrs, viewsCtrl) {
            element.bind('click', function(){
                $rootScope.go(attrs.view);
            });
          },
          template: function(element, attrs){
            return "<button>" + element[0].innerHTML + "</button>";
          }
        };
    })
    .directive('back', function($rootScope) {
        return {
          restrict: 'E',
          replace: true,
          link: function(scope, element, attrs, viewsCtrl) {
            element.bind('click', function(){
                $rootScope.back(attrs.view);
            })
          },
          template: function(element, attrs){
            return "<button>" + element[0].innerHTML + "</button>";
          }
        };
    })
    .directive('contenteditable', function() {
      return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
          ngModel: '='
        },
        link: function(scope, element, attrs, ngModel) {
          if(!ngModel) return;
          // Specify how UI should be updated
          ngModel.$render = function() {
            console.log("render");
            console.log(ngModel.$modelValue);
            element.html(ngModel.$viewValue || '');
          };

          // Listen for change events to enable binding
          element.on('blur keyup change', function() {
            scope.$modelValue = element.html();
            ngModel.$setViewValue(element.html());
            scope.$apply();
            // scope.$apply(read);
          });
          read();
          
          // Write data to the model
          function read() {
            var html = element.html();
            if(attrs.stripBr && html == '<br>') {
              html = '';
            }
            ngModel.$setViewValue(html);
          };
        }
      };
    });

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);