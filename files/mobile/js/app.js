'use strict';

var LoginCtrl = function ($scope) {
	$scope.username = "";
	$scope.password = "";
	$scope.domain = "";
	$scope.login = function(){
		console.log("login");
		console.log($scope.username);
		console.log($scope.password);
		console.log($scope.domain);
	};
};

var StorageCtrl = function ($scope) {
	$scope.stores = ["aakjdkalsjdökaljdaslkdjlaksjdlkasjdklajsdlkjaslkdjaslkdjalksdjlkasjdlkasjdlkasjdlkjsalkjdsalkdjaslk", "b", "c"];
};

var App = {
    init: function () {
        FastClick.attach(document.body);
        var baseUrl = "http://api.qotify.com";
        var qotifyApi = new API({baseUrl: baseUrl});
    }
};

App.init();