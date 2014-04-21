'use strict';
var assert = require('assert');

describe('Module: PubSub', function(){
  var sut;

  before(function(done) {
    sut = require('../lib/pubsub.module.js').init({ pollInterval: 1});
    done();
  });
  after(function(done){
    done();
  });
  
  it('should send to a single user', function(done){
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
  it.skip('should receive messages from a user by single channel', function(done){
    sut.subscribe('demo2','demouser', {polling: false}, function(error, data){
      assert.equal(error, null);
      assert.notEqual(data, null);
      sut.send('otheruser', { test: 'bla1' });
      sut.send('demouser', { test: 'bla1' });
      sut.send('demouser', { test: 'bla2' });
      sut.send('anotheruser', { test: 'bla1' });
      sut.publish('demo2', { test: 'bla3' });
    });

    sut.receive('demo2','demouser', function(error, data){
      assert.equal(error, null);
      assert.notEqual(data, null);
      assert.equal(data.length, 3);
      assert.equal(data[0].data.test, 'bla1');
      done();
    });
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

    sut.receiveAll('myuser', function(error, data){
      assert.equal(error, null);
      assert.notEqual(data, null);
      assert.equal(data.length, 8);
      assert.equal(data[0].data.test, 'second myuser bla1');
      done();
    });
  });
});