'use strict';

var path = require('path'),
    assert = require('assert'),
    store,
    sut;

describe('Module: Worker', function(){
  before(function(done) {
    store = require('../lib/store.module.js').init({
      dbPath:'./taskspecdb',
      backupPath:'./backups'
    });
    var hook = require('../lib/hook.module.js').init({pollInterval: 1});
    var eventsource = require('../lib/eventsource.module.js').init(store, hook);
    var template = require('../lib/template.module.js').init({templatesPath:'./test/template_mock'});
    var file = require('../lib/file.module.js').init({templatesPath:'./test/statics_mock'});

    sut = require('../lib/worker.module.js').init({
      tasksPath: path.join(__dirname, './task_mock'),
      backupPath: './backups'
    }, store, hook, eventsource, template, file);
    done();
  });
  after(function(done){
    store.destroy(done);
  });

  describe('on simple tasks', function(){
    it('should create a task',function(done){
      var newTask = new sut.Task('success', []);
      newTask.TaskScript = 'log("Hello!"); done(null,{Message:"Hello world!"});';
      sut.set(newTask.Name, newTask, function(error, data){
        assert.equal(error, null);
        done();
      });
    });
    it('should run a task and success',function(done){
      sut.run('success', [], function(error, data, contentType, log){
        assert.equal(error, null);
        assert.notEqual(data, null);
        assert.equal(data.Message, 'Hello world!');
        assert.equal(log.length, 1);
        assert.equal(log[0], 'Hello!');
        done();
      });
    });
    it('should remove a task',function(done){
      sut.remove('success', function(error, data){
        assert.equal(error, null);
        done();
      });
    });
  });

  describe('on long running tasks', function(){
    it('should create a task with parameters',function(done){
      var newTask = new sut.Task('longrunningsuccess', {Msg:'Hello!!!'});
      newTask.TaskScript = 'timeout(function(){log(params.Msg);},1000); timeout(done,5500);';
      sut.set(newTask.Name, newTask, function(error, data){
        assert.equal(error, null);
        done();
      });
    });
    it('should run long running tasks in parallel and success',function(done){
      sut.run('longrunningsuccess', {Msg:'Hello--1'}, function(error, data, contentType, log){
        assert.equal(error, null);
        assert.equal(log.length, 1);
        assert.equal(log[0], 'Hello--1');
      });

      sut.run('longrunningsuccess', {Msg:'Hello--2'}, function(error, data, contentType, log){
        assert.equal(error, null);
        assert.equal(log.length, 1);
        assert.equal(log[0], 'Hello--2');
        done();
      });
    });
    it('should remove task',function(done){
      sut.remove('longrunningsuccess', function(error, data){
        assert.equal(error, null);
        done();
      });
    });
  });

  describe.skip('on scheduled endless tasks', function(){
    it('should create scheduled endless task with parameters',function(done){
      
      var newTask = new sut.Task('scheduledendlesssuccess', {Msg:'Endless-Scheduled'});
      newTask.TaskScript = 'timeout(function(){debug(params.Msg);}, 500); done();';
      newTask.Schedule = '* * * * * *';
      sut.set(newTask.Name, newTask, function(error, data){
        assert.equal(error, null);
      });

    });
    it('should remove endless scheduled tasks',function(done){
      
      sut.remove('scheduledendlesssuccess', function(error, data){
        assert.equal(error, null);
      });

    });
  });

  describe('on continuous tasks', function(){
    it('should create continuous task with parameters in parallel',function(done){
      
      var newTask = new sut.Task('continuoussuccess', {Msg:'Continuous-1-'});
      newTask.TaskScript = 'var count = 0; timeout(function(){debug(params.Msg+count++);}, 1000); done();';
      newTask.isContinuous = true;
      sut.set(newTask.Name, newTask, function(error, data){
        assert.equal(error, null);
      });

      var newTask2 = new sut.Task('continuous2success', {Msg:'Continuous-2-'});
      newTask2.TaskScript = 'var count = 0; timeout(function(){debug(params.Msg+count++);}, 2000); done();';
      newTask2.isContinuous = true;
      sut.set(newTask2.Name, newTask2, function(error, data){
        assert.equal(error, null);
        setTimeout(done, 6500);
      });

    });
    it('should remove parallel continuous tasks',function(done){
      
      sut.remove('continuoussuccess', function(error, data){
        assert.equal(error, null);
      });

      sut.remove('continuous2success', function(error, data){
        assert.equal(error, null);
        done();
      });

    });
  });

  describe('on scheduled tasks', function(){
    it('should create scheduled task with parameters in parallel',function(done){
      
      var newTask = new sut.Task('scheduledsuccess', {Msg:'Scheduled-1'});
      newTask.TaskScript = 'debug(params.Msg); done();';
      newTask.Schedule = '* * * * * *';
      sut.set(newTask.Name, newTask, function(error, data){
        assert.equal(error, null);
      });

      var newTask2 = new sut.Task('scheduled2success', {Msg:'Scheduled-2'});
      newTask2.TaskScript = 'debug(params.Msg); done();';
      newTask2.Schedule = '*/2 * * * * *';
      sut.set(newTask2.Name, newTask2, function(error, data){
        assert.equal(error, null);
        setTimeout(done, 1000);
      });

    });
    it('should remove parallel scheduled tasks',function(done){
      
      sut.remove('scheduledsuccess', function(error, data){
        assert.equal(error, null);
      });

      sut.remove('scheduled2success', function(error, data){
        assert.equal(error, null);
        done();
      });

    });
  });

});