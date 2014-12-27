'use strict';

var assert = require('assert');
var path = require('path');

describe('Given module: Plugin', function(){
  var sut;

  before(function(done) {
    var subkitPackage = require('../package.json');
    sut = require('../lib/plugin.module.js').init({
      AvailablePlugins: subkitPackage.optionalDependencies
    });
    done();
  });
  after(function(done){
    done();
  });
  
  describe('when list plugins', function(){
    
    it('then should list all available plugins.', function(done){
      
      sut.list(function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 0);
        done();
      });

    });

  });

  describe('when add a `subkit-file-plugin` plugin', function(){
    
    it('then should the plugin installed.', function(done){

      sut.add('subkit-file-plugin', function(error, data){
        assert.ifError(error);
        assert.equal(error, 0);

        sut.list(function(error, data){
          assert.ifError(error);
          assert.equal(data.results.length, 1);
          
          done();
        });
      });

    });

  });

  describe('when add a `unknown-unknown` plugin', function(){
    
    it('then should raise an error.', function(done){

      sut.add('unknown-unknown', function(error, data){
        assert.equal(error, 1);
        done()
      });

    });

  });  

  describe('when remove a plugin', function(){
    
    it('then should the plugin removed.', function(done){

      sut.remove('subkit-file-plugin', function(error, data){
        sut.list(function(error, data){
          assert.ifError(error);
          assert.equal(data.results.length, 0);
          
          done();
        });
      });

    });

  });


});