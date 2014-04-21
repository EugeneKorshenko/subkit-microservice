'use strict';

var assert = require('assert'),
    path = require('path'),
    sut;

describe('Module: File', function(){
  before(function(done) {
    sut = require('../lib/file.module.js').init({ 
      rightsPath: path.join(__dirname, '../rights.json') 
    });
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