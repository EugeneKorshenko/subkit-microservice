'use strict';

var assert = require('assert'),
    path = require('path'),
    sut;

describe('Module: Share', function(){
  before(function(done) {
    sut = require('../lib/share.module.js').init({}, null);
    done();
  });
  after(function(done){
    done();
  });
  
  describe('share', function(){

    describe('list all identities', function(){
      it('should be get all identies', function(done){
        var actual = sut.listIdentities();
        assert.notEqual(actual.length, 0);
        done();
      });
    });

    describe('list by identity', function(){
      it('should be only grant read access', function(done){
        var actual = sut.listByIdentity('anonymous');
        assert.deepEqual(actual['/'], ['GET']);
        assert.deepEqual(actual['/libs'], ['GET']);
        assert.deepEqual(actual['/css'], ['GET']);
        assert.deepEqual(actual['/sdk'], ['GET']);
        assert.deepEqual(actual['/img'], ['GET']);
        assert.deepEqual(actual['/js'], ['GET']);
        assert.deepEqual(actual['/doc'], ['GET']);
        done();
      });
    });

    describe('add share', function(){
      it('should being add a share', function(done){
        sut.add('/demo');
        var actual = sut.list();
        assert.deepEqual(actual['/demo'], {'GET':[],'POST':[],'PUT':[],'DELETE':[]});
        done();
      });
    });

    describe('remove share', function(){
      it('should being remove a share', function(done){
        sut.remove('/demo');
        var actual = sut.list();
        assert.deepEqual(actual['/demo'], undefined);
        done();
      });
    });

    describe('access by /demo1 share', function(){
      it('should being add the /demo1 share', function(done){
        sut.add('/demo1');
        var actual = sut.list();
        assert.deepEqual(actual['/demo1'], {'GET':[],'POST':[],'PUT':[],'DELETE':[]});
        done();
      });
      it('should being grant read access on /demo1 share', function(done){
        sut.grantReadAccess('/demo1', 'myIdent');
        var actual = sut.list();
        assert.deepEqual(actual['/demo1'], {'GET':['myIdent'],'POST':[],'PUT':[],'DELETE':[]});
        done();
      });
      it('should being grant write access on /demo1 share', function(done){
        sut.grantWriteAccess('/demo1', 'myIdent');
        var actual = sut.list();
        assert.deepEqual(actual['/demo1'], {'GET':['myIdent'],'POST':['myIdent'],'PUT':['myIdent'],'DELETE':[]});
        done();
      });
      it('should being grant delete access on /demo1 share', function(done){
        sut.grantDeleteAccess('/demo1', 'myIdent');
        var actual = sut.list();
        assert.deepEqual(actual['/demo1'], {'GET':['myIdent'],'POST':['myIdent'],'PUT':['myIdent'],'DELETE':['myIdent']});
        done();
      });
      it('should being revoke read access on /demo1 share', function(done){
        sut.revokeReadAccess('/demo1', 'myIdent');
        var actual = sut.list();
        assert.deepEqual(actual['/demo1'], {'GET':[],'POST':['myIdent'],'PUT':['myIdent'],'DELETE':['myIdent']});
        done();
      });
      it('should being revoke write access on /demo1 share', function(done){
        sut.revokeWriteAccess('/demo1', 'myIdent');
        var actual = sut.list();
        assert.deepEqual(actual['/demo1'], {'GET':[],'POST':[],'PUT':[],'DELETE':['myIdent']});
        done();
      });
      it('should being revoke delete access on /demo1 share', function(done){
        sut.revokeDeleteAccess('/demo1', 'myIdent');
        var actual = sut.list();
        assert.deepEqual(actual['/demo1'], {'GET':[],'POST':[],'PUT':[],'DELETE':[]});
        done();
      });
      it('should being remove the /demo1 share', function(done){
        sut.remove('/demo1');
        var actual = sut.list();
        assert.equal(actual['/demo1'], null);
        done();
      });
    });

    describe('access by /demo2 /demo3 /demo4 share', function(){
      before(function(done){
        sut.grantReadAccess('/', 'superIdent');
        sut.grantDeleteAccess('/', 'superIdent');
        sut.grantReadAccess('/doc', 'superIdent');
        sut.grantWriteAccess('/doc', 'superIdent');
        sut.grantDeleteAccess('/doc', 'superIdent');
        sut.add('/demo2');
        sut.grantReadAccess('/demo2', 'superIdent');
        sut.grantDeleteAccess('/demo2', 'superIdent');
        sut.add('/demo3');
        sut.grantWriteAccess('/demo3', 'superIdent');
        sut.add('/demo4');
        sut.grantWriteAccess('/demo4', 'superIdent');
        sut.grantDeleteAccess('/demo4', 'superIdent');
        done();
      });
      after(function(done){
        sut.remove('/demo2');
        sut.remove('/demo3');
        sut.remove('/demo4');
        sut.revokeReadAccess('/', 'superIdent');
        sut.revokeDeleteAccess('/', 'superIdent');
        sut.revokeReadAccess('/doc', 'superIdent');
        sut.revokeWriteAccess('/doc', 'superIdent');
        sut.revokeDeleteAccess('/doc', 'superIdent');
        done();
      });
      it('should being revoke all access on shares', function(done){
        var actual = sut.revokeAccess('superIdent');
        assert.deepEqual(actual, { '/': [],
                                  '/libs': [],
                                  '/css': [],
                                  '/sdk': [],
                                  '/js': [],
                                  '/img': [],
                                  '/doc': [],
                                  '/demo2': [],
                                  '/demo3': [],
                                  '/demo4': [] }
        );
        done();
      });
    });

  });
});