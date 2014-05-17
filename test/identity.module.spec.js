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
        assert.equal(data.length, 4);
        assert.equal(data[0].key, 'account!ident1@subkit.io');
        done();
      });
    });
  });

  describe('add', function(){
    it('by add should be one more item', function(done){
      sut.add('ident5@subkit.io', {}, function(error, data){
        assert.ifError(error);
        sut.listAll(function(error, data){
          assert.equal(data.length, 5);
          assert.equal(data[4].key, 'account!ident5@subkit.io');
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
      sut.get('ident5@subkit.io', function(error, data){
        assert.ifError(error);
        assert.equal(data['group'], null);

        sut.update('ident5@subkit.io', {group: 'Z'}, function(error, data){
          assert.ifError(error);
          
          sut.get('ident5@subkit.io', function(error, data){
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
        assert.equal(data.A1.length, 2);
        assert.equal(data.A2.length, 2);
        assert.equal(data.Z.length, 1);
        done();
      });
    }),
    it('should be grouped by group property and filter by group name', function(done){
      sut.find({groupingKey: 'value.group'},{"value.group":'Z'}, function(error, data){
        assert.ifError(error);
        assert.equal(data['A2'], null);
        assert.equal(data.Z.length, 1);
        done();
      });
    }),
    it('should be grouped by group property and filter by group name Z or A2', function(done){
      sut.find({groupingKey: 'value.group'},{$or:[{"value.group":'A2'},{"value.group":'Z'}]}, function(error, data){
        assert.ifError(error);
        assert.equal(data.A2.length, 2);
        assert.equal(data.Z.length, 1);
        done();
      });
    })
  });

});