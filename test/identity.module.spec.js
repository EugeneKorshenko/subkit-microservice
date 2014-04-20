var assert = require('assert'),
    sut;

before(function(done) {
    sut = require('../lib/identity-module.js').init();
    setTimeout(done, 1000);
});

after(function(done){
    done();
});

describe('Module: Identity', function(){
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