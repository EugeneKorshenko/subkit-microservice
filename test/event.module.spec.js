'use strict';
var assert = require('assert');

describe('Module: Event', function(){
  var store,
      sut;

  before(function(done) {
    store = require('../lib/store.module.js').init({
      dbPath:'./eventspecdb',
      backupPath:'./backups'
    });
    sut = require('../lib/event.module.js').init({ pollInterval: 1}, store);
    require('../lib/eventsource.module.js').init(store, sut);
    done();
  });
  after(function(done){
    setTimeout(function(){
      store.destroy(done);       
    }, 2000);
  });
  
  it('should send to a single user', function(done){
    var count = 0;
    sut.subscribePersistent('demo','demouser', function(error, data){
      count++;
      assert.equal(error, null);
      assert.notEqual(data, null);
      assert.equal(data.$clientId, 'demouser');
    });
    sut.subscribePersistent('demo','otheruser', function(error, data){
      count++;
      assert.equal(error, null);
      assert.notEqual(data, null);
      assert.equal(data.$clientId, 'otheruser');
    });    
    sut.send('otheruser', { test: 'foo1' });
    sut.send('demouser', { test: 'foo1' });
    sut.send('anotheruser', { test: 'foo1' });
    sut.send('demouser', { test: 'foo2' });

    assert.equal(count, 3);
    done();
  });

  it('should receive messages from a user by single channel', function(done){
    sut.publishPersistent('demo1', { test: 'foo1' });
    sut.publishPersistent('demo1', { test: 'foo2' });
    sut.publishPersistent('demo1', { test: 'foo3' });

    sut.publishPersistent('demo2', { test: 'foo4' });
    sut.publishPersistent('demo2', { test: 'foo5' });
    sut.publishPersistent('demo2', { test: 'foo6' });

    setTimeout(function(){

      sut.history('demo', {}, {},function(error, data){
        assert.equal(error, null);
        assert.notEqual(data.results, null);
        assert.equal(data.results.length, 6);
        assert.equal(data.results[0].$payload.test, 'foo6');
      });

      sut.history('demo1!', {}, {},function(error, data){
        assert.equal(error, null);
        assert.notEqual(data.results, null);
        assert.equal(data.results.length, 3);
        assert.equal(data.results[0].$payload.test, 'foo3');
      });

      sut.history('demo2!', {}, {},function(error, data){
        assert.equal(error, null);
        assert.notEqual(data.results, null);
        assert.equal(data.results.length, 3);
        assert.equal(data.results[0].$payload.test, 'foo6');
        done();
      });

    }, 1000);
  });

  it('should receive messages from a user by multiple channels', function(done){
    sut.subscribe('demo1','myuser', function(error, data){
      assert.equal(error, null);
      assert.notEqual(data, null);
      sut.send('otheruser', { test: 'otheruser foo1' });
      sut.send('myuser', { test: 'first myuser foo1' });
      sut.send('myuser', { test: 'first myuser foo2' });
      sut.send('anotheruser', { test: 'anotheruser foo1' });
      sut.publishPersistent('demo1', { test: 'demo1 foo3' });
    });

    sut.subscribe('demo2','myuser', function(error, data){
      assert.equal(error, null);
      assert.notEqual(data, null);
      sut.send('otheruser', { test: 'otheruser foo1' });
      sut.send('myuser', { test: 'second myuser foo1' });
      sut.send('myuser', { test: 'second myuser foo2' });
      sut.send('anotheruser', { test: 'anotheruser foo1' });
      sut.publishPersistent('demo2', { test: 'demo2 foo3' });
    });

    setTimeout(function(){
      sut.history('demo2!',{},{}, function(error, data){
        assert.equal(error, null);
        assert.notEqual(data.results, null);
        assert.equal(data.results.length, 3);
        assert.equal(data.results[0].$payload.test, 'foo6');
        done();
      });

    }, 1000);

  });
});