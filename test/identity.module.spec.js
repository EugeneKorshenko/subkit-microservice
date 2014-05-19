'use strict';

var assert = require('assert'),
    path = require('path'),
    store,
    sut;

describe('Module: Identity', function(){
  before(function(done) {
    store = require('../lib/store.module.js').init({
      dbPath:'./identityspecdb',
      rightsPath:'./rights.json',
      tasksPath:'./tasks',
      backupPath:'./backups'
    });
    sut = require('../lib/identity.module.js').init('account', store);

    sut.add('ident1@subkit.io', {test: 'ident1 test', group: 'A1'});
    sut.add('ident2@subkit.io', {test: 'ident2 test', group: 'A1'});
    sut.add('ident3@subkit.io', {test: 'ident3 test', group: 'A2'});
    sut.add('ident4@subkit.io', {test: 'ident4 test', group: 'A2'});
    sut.add('ident5@subkit.io', {test: 'ident5 test', group: ['A1','X']});
    done();
  });
  after(function(done){
    store.destroy(done);
  });
  
  describe('get', function(){
    it('should be get an item by key', function(done){
      sut.get('ident3@subkit.io', function(error, data){
        assert.ifError(error);
        assert.notEqual(data, null);
        assert.equal(data.id, 'ident3@subkit.io');
        done();
      });
    });
  });
  describe('list', function(){
    it('should be list all keys', function(done){
      sut.listAll(function(error, data){
        assert.ifError(error);
        assert.equal(data.length, 5);
        assert.equal(data[0].key, 'account!ident1@subkit.io');
        done();
      });
    });
  });
  describe('findAll', function(){
    it('should be list all items', function(done){
      sut.findAll({},{},function(error, data){
        assert.ifError(error);
        assert.equal(data.length, 5);
        done();
      });
    });
  });
  describe('add', function(){
    it('by add should be one more item', function(done){
      sut.add('ident6@subkit.io', {}, function(error, data){
        assert.ifError(error);
        sut.listAll(function(error, data){
          assert.equal(data.length, 6);
          assert.equal(data[5].key, 'account!ident6@subkit.io');
          done();
        });
      });
    }),
    it('by duplicate key should be an error', function(done){
      sut.add('ident3@subkit.io', {}, function(error, data){
        assert.notEqual(error, null);
        done();
      });
    });
  });
  describe('update', function(){
    it('by update item should be changed item', function(done){
      sut.get('ident6@subkit.io', function(error, data){
        assert.ifError(error);
        assert.equal(data['group'], null);

        sut.update('ident6@subkit.io', {group: 'Z'}, function(error, data){
          assert.ifError(error);
          
          sut.get('ident6@subkit.io', function(error, data){
            assert.ifError(error);
            assert.notEqual(data['group'], null);
            assert.equal(data['group'], 'Z');
            done();
          });

        });

      });
    });
  });
  describe('find', function(){
    it('should be grouped by group property', function(done){
      sut.find({groupingKey: 'value.group'}, {}, function(error, data){
        assert.ifError(error);
        assert.equal(data.A1.length, 3);
        assert.equal(data.A2.length, 2);
        assert.equal(data.Z.length, 1);
        assert.equal(data.X.length, 1);
        done();
      });
    }),
    it('should be grouped by group property and filter by group name "Z"', function(done){
      sut.find({groupingKey: 'value.group'},{"value.group":'Z'}, function(error, data){
        assert.ifError(error);
        assert.equal(data['A2'], null);
        assert.equal(data.Z.length, 1);
        done();
      });
    }),
    it('should be grouped by group property and filter by group name "Z" or "A2"', function(done){
      sut.find({groupingKey: 'value.group'},{$or:[{"value.group":'A2'},{"value.group":'Z'}]}, function(error, data){
        assert.ifError(error);
        assert.equal(data.A2.length, 2);
        assert.equal(data.Z.length, 1);
        done();
      });
    })
    it('should be grouped by group property and filter by group name "A1" and "X"', function(done){
      sut.find({groupingKey: 'value.group'},{$and:[{"value.group":'A1'},{"value.group":'X'}]}, function(error, data){
        assert.ifError(error);
        assert.equal(data.A1.length, 1);
        assert.equal(data.X.length, 1);
        assert.equal(data.A1[0].key, 'account!ident5@subkit.io');
        assert.equal(data.X[0].key, 'account!ident5@subkit.io');
        done();
      });
    }),
    it('should be grouped by group property and filter by group name "X"', function(done){
      sut.find({groupingKey: 'value.group'},{"value.group":{$in:['X']}}, function(error, data){
        assert.ifError(error);
        assert.equal(data.A1.length, 1);
        assert.equal(data.X.length, 1);
        assert.equal(data.A1[0].key, 'account!ident5@subkit.io');
        assert.equal(data.X[0].key, 'account!ident5@subkit.io');
        done();
      });
    })
  });
  describe('remove', function(){
    it('should be remove a items', function(done){
      sut.remove('ident1@subkit.io',function(error, data){
        assert.ifError(error);
        
        sut.listAll(function(error, data){
          assert.ifError(error);
          assert.equal(data.length, 5);  

          sut.get('ident1@subkit.io', function(error, data){
            assert.notEqual(error, null);
            assert.equal(data, null);
            done();
          });
        });

      });
      
    });
  });
});