'use strict';

var assert = require('assert'),
    sut;

describe('Module: Template', function(){
  before(function(done) {
    sut = require('../lib/template.module.js').init();
    setTimeout(done, 1000);
  });
  after(function(done){
    done();
  });
  
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