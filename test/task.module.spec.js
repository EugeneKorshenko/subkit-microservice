'use strict';

var assert = require('assert'),
    store,
    sut;

describe('Module: Tasks', function(){
  before(function(done) {
    store = require('../lib/store.module.js').init({
      dbPath:'./taskspecdb',
      rightsPath:'./rights.json',
      tasksPath:'./tasks',
      backupPath:'./backups'
    });
    var pubsub = require('../lib/pubsub-module.js').init({pollInterval: 1});
    var eventsource = require('../lib/eventsource-module.js').init(store, pubsub);
    sut = require('../lib/task-module.js').init({}, store, pubsub, null, eventsource, null);
    setTimeout(done, 1800);
  });
  after(function(done){
    setTimeout(function(){
        store.destroy(console.log);
        done();
    }, 1800);
  });

  describe('on ...', function(){
    before(function(done){
      done();
    });
    after(function(done){
      done();
    }),
    it('should be ...', function(done){
      done();
    });
  });
});

// describe('tasks', function(){
//   it('should run a task in folder and success',function(done){
//     sut.run("success", {}, function(error, data){
//       assert.equal(error, undefined);
//       assert.notEqual(data, undefined);
//       assert.equal(data.message, "test success");
//       done();
//     });
//   }),
//   it('should run a task in folder and failure',function(done){
//     sut.run("failure", {}, function(error, data){
//       assert.notEqual(error, undefined);
//       assert.equal(data, undefined);
//       assert.equal(error.message, "test failure");
//       done();
//     });
//   }),
//   it('should run a task in folder and error',function(done){
//     sut.run("error", {}, function(error, data){
//       assert.notEqual(error, undefined);
//       assert.equal(data, undefined);
//       assert.throws(error, Error);
//       done();
//     });
//   }),
//   it('should run the "schema" task with parameters and storage context',function(done){
//     sut.run("schema", { store: "bdemob" }, function(error, data){
//       assert.equal(error, undefined);
//       assert.notEqual(data, undefined);
//       assert.equal(data.test, "");
//       assert.equal(data.test2, "");
//       done();
//     });
//   }),
//   it('should run the "move" task to move items from store -> to store',function(done){
    
//     sut.run("move", { from: "bdemoc", to: "bdemocTmp" }, function(error, data){
//       assert.equal(error, undefined);
//       assert.notEqual(data, undefined);

//       sut.read("bdemoc!", {}, function(error, data){
//         assert.equal(error, undefined);
//         assert.notEqual(data, undefined);
//         assert.equal(data.length, 0);
//         sut.read("bdemocTmp!", {}, function(error, data){
//           assert.equal(error, undefined);
//           assert.notEqual(data, undefined);
//           assert.equal(data.length, 1);
//           done();
//         });
//       });
//     });
//   }),
//   it('should create a task, change code and run',function(done){
//     var ctx = {count:0};
//     var task = sut.task("first", ctx, function(error, data){
//       assert.equal(error, undefined);
//       assert.notEqual(data, undefined);
//       assert.equal(data.count, 1);
//     });
//     task();
//     task = sut.task("second", ctx, function(error, data){
//       assert.equal(error, undefined);
//       assert.notEqual(data, undefined);
//       assert.equal(data.count, 3);
//       done();
//     });
//     task();
//   }),
//   it('should run the "expand" task to execute "demoFunction" function from context',function(done){
//     var ctx = sut.run("expand", { }, function(error, data){
//       assert.equal(error, undefined);
//       assert.notEqual(data, undefined);
//     });
//     var data = ctx.demoFunction("demo");
//     assert.notEqual(data, undefined);
//     assert.equal(data, "demo new");
//     done();
//   });
// });