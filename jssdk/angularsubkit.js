"use strict";

var AngularSubkit;

angular.module("subkit", []).value("Subkit", Subkit);

angular.module("subkit").factory("angularSubkit", ["$q", "$parse", "$timeout",
  function($q, $parse, $timeout) {
    return function(ref, scope, name, initial) {
      var af = new AngularSubkit($q, $parse, $timeout, ref);
      return af.associate(scope, name, initial);
    };
  }
]);

AngularSubkit = function($q, $parse, $timeout, ref) {
  this._q = $q;
  this._parse = $parse;
  this._timeout = $timeout;

  if (typeof ref == "string") {
    throw new Error("Please provide a Subkit reference instead " +
      "of a URL, eg: new Subkit(url)");
  }
  this._fRef = ref;
};

AngularSubkit.prototype = {
  associate: function($scope, name, initial) {
    var self = this;
    var deferred = this._q.defer();
    if(!$scope[name]) $scope[name] = initial;

    this._fRef.on(name, function(data) {
      if(initial instanceof Array) $scope[name].push(data.value);
      else if(initial instanceof Object) $scope[name] = data.value;
      $scope.$apply();
    });
  },

  disassociate: function(name) {
    var self = this;
    this._fRef.off(name);
  },

  _log: function(msg) {
    if (console && console.log) {
      console.log(msg);
    }
  }
};