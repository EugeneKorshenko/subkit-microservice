'use strict';

var assert = require('assert'),
    path = require('path'),
    sut;

describe('Module: Share', function(){
  before(function(done) {
    sut = require('../lib/share.module.js').init({});
    done();
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