'use strict';
var slideOpts = {
    sl:     ['slin',   'slout' ],    
    sr:     ['srin',   'srout' ],    
    popin:  ['popin',  'noanim'],    
    popout: ['noanim', 'popout'],    
};
var Slide = function (slideType, vin, vout, callback) {
    if(vin === "undefined" || vout === "undefined") return callback();
    var vIn = document.querySelector('view[data-content="'+ vin + '"]'),
        vOut = document.querySelector('view[data-content="'+ vout + '"]'),
        onAnimationEnd = function () {
            if(vin !== vout) vOut.classList.add('hidden');
            if(vin !== vout) vIn.classList.remove(slideOpts[slideType][0]);
            if(vin !== vout) vOut.classList.remove(slideOpts[slideType][1]);
            vOut.removeEventListener('webkitAnimationEnd', onAnimationEnd, false);
            vOut.removeEventListener('animationend',       onAnimationEnd);
        };

    vOut.addEventListener('webkitAnimationEnd', onAnimationEnd, false);
    vOut.addEventListener('animationend',       onAnimationEnd);
    if (callback && typeof(callback) === 'function') {
        callback();
    }
    vIn.classList.remove('hidden');
    if(vin !== vout) vIn.classList.add(slideOpts[slideType][0]);
    if(vin !== vout) vOut.classList.add(slideOpts[slideType][1]);
};

var app = angular
    .module('app', ['ngSanitize'])
    .factory('Navigation', function() {
      var views = {},
          lasts = [],
          listener = [],
          current = "";
      return function($rootScope) {
        var changed = function(name){
          for (var i = 0; i < listener.length; i++) {
            listener[i](name);
          };
        };
        this.onChanged = function(callback){
          listener.push(callback);
        };
        this.show = function(){
            Slide('popin', "notify", current);
            current = "notify";
            changed(current);
        };
        this.go = function(name) {
            Slide('sl', name, current);
            lasts.push(current);
            current = name;
            changed(current);
        };
        this.back = function(name) {
            if(name === "undefined") name = lasts.pop();
            Slide('sr', name, current);
            current = name;
            changed(current);
        };
        this.addView = function(name, view) {
            view.name = name;
            views[name] = view;
            if(Object.keys(views).length===1) current = name;
        };
        if($rootScope) {
          $rootScope.views = views;
          $rootScope.go = this.go;
          $rootScope.back = this.back;
        }
      };
    })
    .directive('views', ["Navigation", function(Navigation) {
        return {
            restrict: 'E',
            transclude: true,
            scope:{},
            controller: Navigation,
            template: '<div ng-transclude></div>'
        };
    }])
    .directive('view', function($rootScope) {
        return {
          require: '^views',
          restrict: 'E',
          transclude: true,
          scope:true,
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

            if(backText) backElement = '<back data-view="'+backTarget+'" class="left">'+backText+'</back>';
            if(nextText) nextElement = '<go data-view="'+nextTarget+'" class="right">'+nextText+'</go>';
            return '<section><header><h1>'+headerText+'</h1>'+backElement+nextElement+'</header><div class="scrollMask"></div><div class="scrollWrap"><div class="scroll"><div class="content" data-ng-transclude></div></div></div></section>';
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
    app.directive('script', function() {
      return {
        restrict: 'E',
        scope: true,
        link: function(scope, elem, attr) {
          if (attr.type=='text/javascript-lazy') {
            loadjscssfile(attr.name + '/www/' + attr.script + '.js','js');
        }
      }
    };
  });

function loadjscssfile(filename, filetype){
  if (filetype=="js"){ //if filename is a external JavaScript file
    var fileref=document.createElement('script')
    fileref.setAttribute("type","text/javascript")
    fileref.setAttribute("src", filename)
  }
  else if (filetype=="css"){ //if filename is an external CSS file
    var fileref=document.createElement("link")
    fileref.setAttribute("rel", "stylesheet")
    fileref.setAttribute("type", "text/css")
    fileref.setAttribute("href", filename)
  }
  if (typeof fileref!="undefined")
    document.getElementsByTagName("head")[0].appendChild(fileref)
}

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);