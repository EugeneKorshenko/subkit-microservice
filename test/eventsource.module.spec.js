'use strict';

var assert = require('assert');

describe('Module: EventSource', function(){
  var store, event, sut;

  before(function(done) {
    store = require('../lib/store.module.js').init({
      dbPath:'./eventsourcedb',
      backupPath:'./backups'
    });
    event = require('../lib/event.module.js').init({pollInterval: 1});
    sut = require('../lib/eventsource.module.js').init(store, event);
    
   event.publishPersistent('demo1','a',{});
   event.publishPersistent('demo2','d',{});
   event.publishPersistent('demo1','b',{});
   event.publishPersistent('demo2','b',{});
   event.publishPersistent('demo2','a',{});
   event.publishPersistent('demo2','c',{});
   event.publishPersistent('demo3','a',{});
    setTimeout(done, 1000);
  });
  after(function(done){
    store.destroy(done);
  });
  
  describe('on eventsource', function(){

    it('should be run a projection', function(done){
      sut
      .from(['demo1','demo2','demo5'])
      .run({ 
        $init: function(state){
          if(!state.count) state.count = 0;
          return state;
        },
        $complete: function(state){ 
          return state;
        },
        demo1: function(state, message){
          state.count += 1;
          return state;
        },
        demo2: function(state, message){
          state.count += 1;
          return state;
        }
      }, function(err, data){
        assert.equal(null, err);
        assert.notEqual(null, data);
        assert.equal(data.count, 6);
        done();
      });
    });
    it('should be a live projection', function(done){
      //sample messages
      setTimeout(function(){
        event.publish('demo1','g',{});
      }, 5);
      setTimeout(function(){
        event.publish('demo2','t',{});
      }, 5);
      setTimeout(function(){
        event.publish('demo5','t',{});
      }, 5);
      setTimeout(function(){
        event.publish('demo15','t',{});
      }, 5);

      sut
      .from(['demo1','demo2','demo5'])
      .on({ 
        $init: function(state){
          if(!state.count) state.count = 0;
          return state;
        },
        $complete: function(state){ 
          return state;
        },
        demo1: function(state, message){
          state.count += 1;
          return state;
        },
        demo2: function(state, message){
          state.count += 1;
          return state;
        }
      }, function(err, data){
        assert.equal(null, err);
        assert.notEqual(null, data);
      });
      
      setTimeout(done, 500);
    });
    it('should be a incremental live projection', function(done){
      //sample messages
      setTimeout(function(){
        event.publish('demo1','g',{});
      }, 100);
      setTimeout(function(){
        event.publish('demo2','t',{});
      }, 200);
      setTimeout(function(){
        event.publish('demo5','t',{});
      }, 300);
      setTimeout(function(){
        event.publish('demo15','t',{});
      }, 400);

      sut
      .from(['myNewProjection'])
      .on({ 
        $init: function(state){
          if(!state.reducedCount) state.reducedCount = 0;
          if(!state.events) state.events = [];
          return state;
        },
        $complete: function(state){ 
          return state;
        },
        myNewProjection: function(state, message){
          state.reducedCount += 1;
          state.events.push(message);
          return state;
        }
      }, function(err, data){
        assert.equal(null, err);
        assert.notEqual(null, data);
      });
      
      sut
      .from(['demo1','demo2','demo5'])
      .on({ 
        $init: function(state){
          if(!state.count) state.count = 0;
          if(!state.events) state.events = [];
          return state;
        },
        $complete: function(state){ 
          return state;
        },
        demo1: function(state, message){
          state.count += 1;
          state.events.push(message);
          return state;
        },
        demo2: function(state, message){
          state.count += 1;
          state.events.push(message);
          return state;
        }
      }, function(err, data){
        assert.equal(null, err);
        assert.notEqual(null, data);
        event.publish('myNewProjection', data.count, data);
      });
      
      setTimeout(done, 500);

    });



  });
});