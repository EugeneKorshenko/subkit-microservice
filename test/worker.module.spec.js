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

  describe('on tasks', function(){
    it('should create a task',function(done){
      var newTask = new sut.Task('success', []);
      newTask.TaskScript = 'log("Hello!"); done(null,{Message:"Hello world!"});';
      sut.set(newTask.Name, newTask, function(error, data){
        assert.equal(error, null);
        done();
      });
    }),
    it('should run a task and success',function(done){
      sut.run('success', [], function(error, data, contentType, log){
        assert.equal(error, null);
        assert.notEqual(data, null);
        assert.equal(data.Message, 'Hello world!');
        assert.equal(log.length, 1);
        assert.equal(log[0], 'Hello!');
        done();
      });
    }),
    it('should remove a task',function(done){
      sut.remove('success', function(error, data){
        assert.equal(error, null);
        done();
      });
    })
  });

  describe('on long running tasks', function(){
    it('should create a task with parameters',function(done){
      var newTask = new sut.Task('longrunningsuccess', {Msg:'Hello!!!'});
      newTask.TaskScript = 'interval(function(){log(params.Msg);},1000); timeout(done,5500);';
      sut.set(newTask.Name, newTask, function(error, data){
        assert.equal(error, null);
        done();
      });
    }),
    it('should run long running tasks in parallel and success',function(done){
      sut.run('longrunningsuccess', {Msg:'Hello--1'}, function(error, data, contentType, log){
        assert.equal(error, null);
        assert.equal(log.length, 5);
        assert.equal(log[0], 'Hello--1');
      });

      sut.run('longrunningsuccess', {Msg:'Hello--2'}, function(error, data, contentType, log){
        assert.equal(error, null);
        assert.equal(log.length, 5);
        assert.equal(log[0], 'Hello--2');
        done();
      });
    }),
    it('should remove task',function(done){
      sut.remove('longrunningsuccess', function(error, data){
        assert.equal(error, null);
        done();
      });
    })
  });

  describe('on contiunous tasks', function(){
    it('should create continuous task with parameters in parallel',function(done){
      
      var newTask = new sut.Task('coninuoussuccess', {Msg:'Hello1-'});
      newTask.TaskScript = 'var count = 0; interval(function(){debug(params.Msg+count++);}, 1000);';
      newTask.isContinuous = true;
      sut.set(newTask.Name, newTask, function(error, data){
        assert.equal(error, null);
      });

      var newTask2 = new sut.Task('coninuous2success', {Msg:'Hello2-'});
      newTask2.TaskScript = 'var count = 0; interval(function(){debug(params.Msg+count++);}, 1000);';
      newTask2.isContinuous = true;
      sut.set(newTask2.Name, newTask2, function(error, data){
        assert.equal(error, null);
        setTimeout(done, 5000);
      });

    }),
    it('should remove parallel contiuous tasks',function(done){
      
      sut.remove('coninuoussuccess', function(error, data){
        assert.equal(error, null);
      });

      sut.remove('coninuous2success', function(error, data){
        assert.equal(error, null);
        done();
      });

    })
  });


});