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
      sut.runTask('success', {}, function(error, data){
        assert.equal(error, undefined);
        assert.notEqual(data, undefined);
        assert.equal(data, 'success');
        done();
      });
    });
    it('should run a task in folder and failure',function(done){
      sut.runTask('failure', {}, function(error, data){
        assert.notEqual(error, undefined);
        assert.equal(data, undefined);
        assert.equal(error, 'failure');
        done();
      });
    });
    it('should run a task in folder and error',function(done){
      sut.runTask("error", {}, function(error, data){
        assert.notEqual(error, undefined);
        assert.equal(data, undefined);
        assert.throws(error, Error);
        done();
      });
    });
  });

});