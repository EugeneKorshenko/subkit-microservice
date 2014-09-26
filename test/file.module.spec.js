'use strict';

var assert = require('assert'),
    path = require('path'),
    sut;

describe('Module: File', function(){
  before(function(done) {
    sut = require('../lib/file.module.js').init({
      staticsPath: path.join(process.cwd(),'files','statics')
    });
    done();
  });
  after(function(done){
    done();
  });

  it('should be create a javascript file', function(done){
    var filePath = path.join(process.cwd(),'files','statics','test','js','app.js');
    sut.writeFile(filePath,'', function(err, data){
      assert.ifError(err);
      done();
    });
  });

  it('should be create a css file', function(done){
    var filePath = path.join(process.cwd(),'files','statics','test','css','style.css');
    sut.writeFile(filePath,'', function(err, data){
      assert.ifError(err);
      done();
    });
  });

  it('should be create a html file', function(done){
    var filePath = path.join(process.cwd(),'files','statics','test','index.html');
    sut.writeFile(filePath,'', function(err, data){
      assert.ifError(err);
      done();
    });
  });

  it('should read the complete directory', function(done){
    var filePath = path.join(process.cwd(),'files','statics','test');
    sut.readDir(filePath, function(err, data){
      assert.ifError(err);
      assert.deepEqual(data,['css','index.html','js']);
      done();
    });
  });

  it('should zip the complete directory', function(done){
    var srcPath = path.join(process.cwd(),'files','statics','test');
    var dstPath = path.join(process.cwd(),'files','statics','zipfile.zip');

    sut.zipDirectory(srcPath, dstPath, function(err, data){
      assert.ifError(err);
      assert.equal(data,dstPath);
      done();
    });

  });

  it('should delete the complete directory', function(done){
    var filePath = path.join(process.cwd(),'files','statics','test');
    sut.delDirectory(filePath, function(err){
      assert.ifError(err);
      done();
    });
  });

  it('should delete the zip file', function(done){
    var filePath = path.join(process.cwd(),'files','statics','zipfile.zip');
    sut.delFile(filePath, function(err){
      assert.ifError(err);
      done();
    });
  });

});