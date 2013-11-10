var App = {
    init: function () {
        FastClick.attach(document.body);
        var baseUrl = "http://api.qotify.com";
        var qotifyApi = new API({baseUrl: baseUrl});
    }
};

App.init();