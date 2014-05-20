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
      jobsPath: path.join(__dirname, './job_mock'),
      mapreducePath: path.join(__dirname, './mr_mock'),
      backupPath: './backups'
    }, store, pubsub, eventsource);
    done();
  });
  after(function(done){
    store.destroy(done);
  });

  describe('tasks', function(){
    it('should run a task in folder and success',function(done){
      sut.runTask('success', {}, function(error, data, log){
        assert.equal(error, null);
        assert.notEqual(data, null);
        assert.equal(data, 'success');
        assert.notEqual(log, null);
        done();
      });
    });
    it('should run a task in folder and failure',function(done){
      sut.runTask('failure', {}, function(error, data, log){
        assert.notEqual(error, null);
        assert.equal(data, undefined);
        assert.deepEqual(error, new Error('failure'));
        assert.deepEqual(log, []);
        done();
      });
    });
    it('should run a task in folder and throws new error',function(done){
      sut.runTask("error", {}, function(error, data, log){
        assert.notEqual(error, null);
        assert.equal(data, null);
        assert.throws(error, Error);
        assert.deepEqual(log, []);
        done();
      });
    });
    it('should run a task in folder and throws syntax error',function(done){
      sut.runTask("syntax_error", {}, function(error, data, log){
        assert.notEqual(error, null);
        assert.equal(data, undefined);
        assert.throws(error, Error);
        assert.deepEqual(error, new Error('kk is not define'));
        assert.deepEqual(log, []);
        done();
      });
    });
  });

});