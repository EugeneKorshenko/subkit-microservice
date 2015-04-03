'use strict';
var assert = require('assert');

describe('Module: Event', function(){
  var store,
      sut;

  before(function(done) {
    var logger = require('../lib/logger.module.js').init();
    store = require('../lib/store.module.js').init({
      dbPath:'./eventspecdb',
      backupPath:'./backups'
    }, logger);
    sut = require('../lib/event.module.js').init({}, store, logger);
    done();
  });
  after(function(done){
    setTimeout(function(){
      store.destroy(done);       
    }, 2000);
  });
  
  it('should emit message to channels', function(done){
    var count1 = 0;
    var count2 = 0;
    sut.bindPersistent('demo1', null, function(error, data){
      count1++;
      assert.equal(error, null);
      assert.notEqual(data, null);
    });
    sut.bindPersistent('demo2', null, function(error, data){
      count2++;
      assert.equal(error, null);
      assert.notEqual(data, null);
    });    
    sut.emit('demo1', { test: 'demo1 foo1' });
    sut.emit('demo2', { test: 'demo2 foo1' });
    sut.emit('demo1', { test: 'demo1 foo3' });
    sut.emit('demo1', { test: 'demo1 foo2' });
    sut.emit('demo2', { test: 'demo2 foo2' });

    setTimeout(function(){
      assert.equal(count1, 3);
      assert.equal(count2, 2);
      done();
    }, 20);
  });

  it('should receive messages from a user by single channel', function(done){
    sut.emit('demo1', { test: 'foo1' }, {}, true);
    sut.emit('demo1', { test: 'foo2' }, {}, true);
    sut.emit('demo1', { test: 'foo3' }, {}, true);

    sut.emit('demo2', { test: 'foo4' }, {}, true);
    sut.emit('demo2', { test: 'foo5' }, {}, true);
    sut.emit('demo2', { test: 'foo6' }, {}, true);

    setTimeout(function(){

      sut.log('demo1', {}, {}, function(error, data){
        assert.equal(error, null);
        assert.notEqual(data.results, null);
        assert.equal(data.results.length, 3);
        assert.equal(data.results[0].$payload.test, 'foo1');
        assert.equal(data.results[2].$payload.test, 'foo3');
      });

      sut.log('demo2', {}, {},function(error, data){
        assert.equal(error, null);
        assert.notEqual(data.results, null);
        assert.equal(data.results.length, 3);
        assert.equal(data.results[0].$payload.test, 'foo4');
        assert.equal(data.results[2].$payload.test, 'foo6');
        done();
      });

    }, 100); //persistent event ~100ms write latency
  });

  it('should filtered receive emitted messages', function(done){
    var count1 = 0;
    var count2 = 0;
    sut.bindPersistent('demo1', { id: {$exists:true} }, function(error, data){
      count1++;
      assert.equal(error, null);
      assert.notEqual(data, null);
    });
    sut.bindPersistent('demo2', { id: {$exists:true} }, function(error, data){
      count2++;
      assert.equal(error, null);
      assert.notEqual(data, null);
    });    
    sut.emit('demo1', { test: 'demo1 foo1', id: 1 });
    sut.emit('demo2', { test: 'demo2 foo1' });
    sut.emit('demo1', { test: 'demo1 foo3', id: 2 });
    sut.emit('demo1', { test: 'demo1 foo2' });
    sut.emit('demo2', { test: 'demo2 foo2', id: 1 });

    setTimeout(function(){
      assert.equal(count1, 2);
      assert.equal(count2, 1);
      done();
    }, 100);  //persistent event ~100ms write latency
  });

});
