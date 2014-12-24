'use strict';
var assert = require('assert');

describe('Module: Hook', function(){
  var store,
      sut;

  before(function(done) {
    store = require('../lib/store.module.js').init({
      dbPath:'./hookspecdb',
      backupPath:'./backups'
    });
    sut = require('../lib/hook.module.js').init({ pollInterval: 1}, store);
    require('../lib/eventsource.module.js').init(store, sut);
    done();
  });
  after(function(done){
    setTimeout(function(){
      store.destroy(done);       
    }, 2000);
  });
  
  it('should send to a single user', function(done){
    sut.subscribe('demo','demouser', {polling: true}, function(error, data){
      assert.equal(error, null);
      assert.notEqual(data.results, null);
      assert.equal(data.results.length, 2);
      assert.equal(data.results[0].$payload.test, 'bla1');
    });
    sut.send('otheruser', { test: 'bla1' });
    sut.send('demouser', { test: 'bla1' });
    sut.send('demouser', { test: 'bla2' });
    sut.send('anotheruser', { test: 'bla1' });
    done();
  });

  it('should receive messages from a user by single channel', function(done){
    sut.publishPersistent('demo1', { test: 'bla1' });
    sut.publishPersistent('demo1', { test: 'bla2' });
    sut.publishPersistent('demo1', { test: 'bla3' });

    sut.publishPersistent('demo2', { test: 'bla4' });
    sut.publishPersistent('demo2', { test: 'bla5' });
    sut.publishPersistent('demo2', { test: 'bla6' });

    setTimeout(function(){

      sut.history('demo', {}, {},function(error, data){
        assert.equal(error, null);
        assert.notEqual(data.results, null);
        assert.equal(data.results.length, 6);
        assert.equal(data.results[0].$payload.test, 'bla6');
      });

      sut.history('demo1!', {}, {},function(error, data){
        assert.equal(error, null);
        assert.notEqual(data.results, null);
        assert.equal(data.results.length, 3);
        assert.equal(data.results[0].$payload.test, 'bla3');
      });

      sut.history('demo2!', {}, {},function(error, data){
        assert.equal(error, null);
        assert.notEqual(data.results, null);
        assert.equal(data.results.length, 3);
        assert.equal(data.results[0].$payload.test, 'bla6');
        done();
      });

    }, 1000);
  });

  xit('should receive messages from a user by multiple channels', function(done){
    sut.subscribe('demo1','myuser', {polling: false}, function(error, data){
      assert.equal(error, null);
      assert.notEqual(data, null);
      sut.send('otheruser', { test: 'otheruser bla1' });
      sut.send('myuser', { test: 'first myuser bla1' });
      sut.send('myuser', { test: 'first myuser bla2' });
      sut.send('anotheruser', { test: 'anotheruser bla1' });
      sut.publishPersistent('demo1', { test: 'demo1 bla3' });
    });

    sut.subscribe('demo2','myuser', {polling: false}, function(error, data){
      assert.equal(error, null);
      assert.notEqual(data, null);
      sut.send('otheruser', { test: 'otheruser bla1' });
      sut.send('myuser', { test: 'second myuser bla1' });
      sut.send('myuser', { test: 'second myuser bla2' });
      sut.send('anotheruser', { test: 'anotheruser bla1' });
      sut.publishPersistent('demo2', { test: 'demo2 bla3' });
    });

    sut.history('demo2!',{},{}, function(error, data){
      assert.equal(error, null);
      assert.notEqual(data.results, null);
      assert.equal(data.results.length, 8);
      assert.equal(data.results[0].$payload.test, 'second myuser bla1');
      done();
    });
  });
});