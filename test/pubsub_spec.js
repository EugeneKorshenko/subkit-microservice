var assert = require('assert'),
    restify = require('restify');

var client = restify.createJsonClient({
  version: '*',
  url: 'http://127.0.0.1:8080',
  headers: {"api_key":"6654edc5-82a3-4006-967f-97d5817d7fe2"}
});

before(function(done) {
    require('../server');
    done();
});

after(function(done){
  done();
});

describe('service: store', function(){
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

// var assert = require('assert'),
//   pubsub = require('../').init({ pollInterval: 1});

// before(function(done) {
//   done();
// });

// describe('module: messaging', function(){
//   it('should send to a single user', function(done){
//     pubsub.subscribe("demo","demouser", {polling: true}, function(error, data){
//       assert.equal(error, null);
//       assert.notEqual(data, null);
//       assert.equal(data.length, 2);
//       assert.equal(data[0].data.test, "bla1");
//     });
//     pubsub.send("otheruser", { test: "bla1" }, function(error, data){});
//     pubsub.send("demouser", { test: "bla1" }, function(error, data){});
//     pubsub.send("demouser", { test: "bla2" }, function(error, data){});
//     pubsub.send("anotheruser", { test: "bla1" }, function(error, data){});
//     done();
//   }),
//   it('should receive messages from a user by single channel', function(done){
//     pubsub.subscribe("demo2","demouser", {polling: false}, function(error, data){
//       assert.equal(error, null);
//       assert.notEqual(data, null);
//       pubsub.send("otheruser", { test: "bla1" }, function(error, data){});
//       pubsub.send("demouser", { test: "bla1" }, function(error, data){});
//       pubsub.send("demouser", { test: "bla2" }, function(error, data){});
//       pubsub.send("anotheruser", { test: "bla1" }, function(error, data){});
//       pubsub.publish("demo2", { test: "bla3" }, function(error, data){});
//     });

//     pubsub.receive("demo2","demouser", function(error, data){
//       assert.equal(error, null);
//       assert.notEqual(data, null);
//       assert.equal(data.length, 3);
//       assert.equal(data[0].data.test, "bla1");
//       done();
//     });
//   }),
//   it('should receive messages from a user by multiple channels', function(done){
//     pubsub.subscribe("demo1","myuser", {polling: false}, function(error, data){
//       assert.equal(error, null);
//       assert.notEqual(data, null);
//       pubsub.send("otheruser", { test: "otheruser bla1" }, function(error, data){});
//       pubsub.send("myuser", { test: "first myuser bla1" }, function(error, data){});
//       pubsub.send("myuser", { test: "first myuser bla2" }, function(error, data){});
//       pubsub.send("anotheruser", { test: "anotheruser bla1" }, function(error, data){});
//       pubsub.publish("demo1", { test: "demo1 bla3" }, function(error, data){});
//     });

//     pubsub.subscribe("demo2","myuser", {polling: false}, function(error, data){
//       assert.equal(error, null);
//       assert.notEqual(data, null);
//       pubsub.send("otheruser", { test: "otheruser bla1" }, function(error, data){});
//       pubsub.send("myuser", { test: "second myuser bla1" }, function(error, data){});
//       pubsub.send("myuser", { test: "second myuser bla2" }, function(error, data){});
//       pubsub.send("anotheruser", { test: "anotheruser bla1" }, function(error, data){});
//       pubsub.publish("demo2", { test: "demo2 bla3" }, function(error, data){});
//     });

//     pubsub.receiveAll("myuser", function(error, data){
//       assert.equal(error, null);
//       assert.notEqual(data, null);
//       assert.equal(data.length, 8);
//       assert.equal(data[0].data.test, "second myuser bla1");
//       done();
//     });
//   });
// });