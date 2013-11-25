var assert = require('assert'),
    restify = require('restify');

var client = restify.createJsonClient({
  version: '*',
  url: 'http://127.0.0.1:8080',
  headers: {"api_key":"6654edc5-82a3-4006-967f-97d5817d7fe2"}
});

before(function(done) {
    require('../server');
    done();
});

after(function(done){
  done();
});

describe('service: email', function(){
  describe('on ...', function(){
    before(function(done){
      done();
    });
    after(function(done){
      done();
    }),
    it('should be ...', function(done){
      done();
    });
  });
});