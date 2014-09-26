'use strict';

var assert = require('assert'),
    path = require('path');

describe('Module: Template', function(){
  var sut;

  before(function(done) {
    sut = require('../lib/template.module.js').init({
      templatesPath: path.join(__dirname,'template_mock')
    });

    done();
  });
  after(function(done){
    done();
  });
  
  describe('on render', function(){
    
    it('should get a rendered template', function(done){
      sut.render('demo1', {}, function(error, data){
        assert.equal(error, null);
        assert.notEqual(data, null);
        done();
      });
    });

  });
});