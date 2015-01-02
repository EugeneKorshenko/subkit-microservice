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
    
   event.emit('demo1',{},{},true);
   event.emit('demo2',{},{},true);
   event.emit('demo1',{},{},true);
   event.emit('demo2',{},{},true);
   event.emit('demo2',{},{},true);
   event.emit('demo2',{},{},true);
   event.emit('demo3',{},{},true);
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
        event.emit('demo1',{},{});
      }, 5);
      setTimeout(function(){
        event.emit('demo2',{},{});
      }, 5);
      setTimeout(function(){
        event.emit('demo5',{},{});
      }, 5);
      setTimeout(function(){
        event.emit('demo15',{},{});
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
        event.emit('demo1',{},{});
      }, 100);
      setTimeout(function(){
        event.emit('demo2',{},{});
      }, 200);
      setTimeout(function(){
        event.emit('demo5',{},{});
      }, 300);
      setTimeout(function(){
        event.emit('demo15',{},{});
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
        event.emit('myNewProjection', data);
      });
      
      setTimeout(done, 500);

    });



  });
});