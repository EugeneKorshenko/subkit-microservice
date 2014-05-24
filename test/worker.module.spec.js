'use strict';

var path = require('path'),
    assert = require('assert'),
    store,
    sut;

describe('Module: Worker', function(){
  before(function(done) {
    store = require('../lib/store.module.js').init({
      dbPath:'./taskspecdb',
      rightsPath:'./rights.json',
      backupPath:'./backups'
    });
    var pubsub = require('../lib/pubsub.module.js').init({pollInterval: 1});
    var eventsource = require('../lib/eventsource.module.js').init(store, pubsub);
    sut = require('../lib/worker.module.js').init({
      tasksPath: path.join(__dirname, './task_mock'),
      backupPath: './backups'
    }, store, pubsub, eventsource);
    done();
  });
  after(function(done){
    store.destroy(done);
  });

  describe.skip('tasks', function(){
    it('should run a task in folder and success',function(done){
      sut.runTask('success', {}, function(error, data, contentType, log){
        assert.equal(error, null);
        assert.notEqual(data, null);
        assert.equal(data, 'success');
        assert.notEqual(log, null);
        done();
      });
    });
    it('should run a task in folder and failure',function(done){
      sut.runTask('failure', {}, function(error, data, contentType, log){
        assert.notEqual(error, null);
        assert.equal(data, undefined);
        assert.deepEqual(error, new Error('failure'));
        assert.deepEqual(log, []);
        done();
      });
    });
    it('should run a task in folder and throws new error',function(done){
      sut.runTask("error", {}, function(error, data, contentType, log){
        assert.notEqual(error, null);
        assert.equal(data, null);
        assert.throws(error, Error);
        assert.deepEqual(log, []);
        done();
      });
    });
    it('should run a task in folder and throws syntax error',function(done){
      sut.runTask("syntax_error", {}, function(error, data, contentType, log){
        assert.notEqual(error, null);
        assert.equal(data, undefined);
        assert.throws(error, Error);
        assert.deepEqual(error, new Error('kk is not define'));
        assert.deepEqual(log, []);
        done();
      });
    });
  });

  describe('tasks2', function(){
    it('should create a task',function(done){
      var newTask = new sut.Task('success', []);
      newTask.TaskScript = 'log("Hello!"); done(null,{Message:"Hello world!"});';
      sut.set(newTask.Name, newTask, function(error, data){
        console.log(error);
        console.log(data);
        done();
      });
    }),
    it('should run a task and success',function(done){
      sut.run2('success', [], function(error, data, contentType, log){
        // assert.equal(error, null);
        console.log(error);
        console.log(data);
        console.log(contentType);
        console.log(log);
        done();
      });
    }),
    it('should remove a task',function(done){
      sut.remove('success', function(error, data){
        console.log(error);
        console.log(data);
        done();
      });
    })
  });

});