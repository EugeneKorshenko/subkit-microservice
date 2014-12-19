'use strict';
var assert = require('assert');

describe('Module: Hook', function(){
  var storage,
      sut;

  before(function(done) {
    storage = require('../lib/store.module.js').init({
      dbPath:'./hookspecdb',
      backupPath:'./backups'
    });
    sut = require('../lib/hook.module.js').init({ pollInterval: 1}, storage);
    require('../lib/eventsource.module.js').init(storage, sut);
    done();
  });
  after(function(done){
    setTimeout(function(){
      storage.destroy(done);      
    }, 1000);
  });
  
  it.skip('should send to a single user', function(done){
    sut.subscribe('demo','demouser', {polling: true}, function(error, data){
      assert.equal(error, null);
      assert.notEqual(data, null);
      assert.equal(data.length, 2);
      assert.equal(data[0].data.test, 'bla1');
    });
    sut.send('otheruser', { test: 'bla1' });
    sut.send('demouser', { test: 'bla1' });
    sut.send('demouser', { test: 'bla2' });
    sut.send('anotheruser', { test: 'bla1' });
    done();
  }),

  it('should receive messages from a user by single channel', function(done){
    sut.publish('demo1', { test: 'bla1' });
    sut.publish('demo1', { test: 'bla2' });
    sut.publish('demo1', { test: 'bla3' });

    sut.publish('demo2', { test: 'bla4' });
    sut.publish('demo2', { test: 'bla5' });
    sut.publish('demo2', { test: 'bla6' });

    setTimeout(function(){

      sut.getTranscript('demo', {}, {},function(error, data){
        assert.equal(error, null);
        assert.notEqual(data, null);
        assert.equal(data.length, 6);
        assert.equal(data[0].value.test, 'bla6');
      });

      sut.getTranscript('demo1!', {}, {},function(error, data){
        assert.equal(error, null);
        assert.notEqual(data, null);
        assert.equal(data.length, 3);
        assert.equal(data[0].value.test, 'bla3');
      });

      sut.getTranscript('demo2!', {}, {},function(error, data){
        assert.equal(error, null);
        assert.notEqual(data, null);
        assert.equal(data.length, 3);
        assert.equal(data[0].value.test, 'bla6');
        done();
      });

    }, 1000);
  }),
  it.skip('should receive messages from a user by multiple channels', function(done){
    sut.subscribe('demo1','myuser', {polling: false}, function(error, data){
      assert.equal(error, null);
      assert.notEqual(data, null);
      sut.send('otheruser', { test: 'otheruser bla1' });
      sut.send('myuser', { test: 'first myuser bla1' });
      sut.send('myuser', { test: 'first myuser bla2' });
      sut.send('anotheruser', { test: 'anotheruser bla1' });
      sut.publish('demo1', { test: 'demo1 bla3' });
    });

    sut.subscribe('demo2','myuser', {polling: false}, function(error, data){
      assert.equal(error, null);
      assert.notEqual(data, null);
      sut.send('otheruser', { test: 'otheruser bla1' });
      sut.send('myuser', { test: 'second myuser bla1' });
      sut.send('myuser', { test: 'second myuser bla2' });
      sut.send('anotheruser', { test: 'anotheruser bla1' });
      sut.publish('demo2', { test: 'demo2 bla3' });
    });

    sut.getTranscript('demo2',{},{}, function(error, data){
      assert.equal(error, null);
      assert.notEqual(data, null);
      assert.equal(data.length, 8);
      assert.equal(data[0].data.test, 'second myuser bla1');
      done();
    });
  });
});