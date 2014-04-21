'use strict';

var assert = require('assert');

describe('Module: EventSource', function(){
  var store, sut;

  before(function(done) {
    store = require('../lib/store.module.js').init({
      dbPath:'./eventsourcedb',
      rightsPath:'./rights.json',
      tasksPath:'./tasks',
      backupPath:'./backups'
    });
    var pubsub = require('../lib/pubsub.module.js').init({pollInterval: 1});
    sut = require('../lib/eventsource.module.js').init(store, pubsub);
    setTimeout(done, 1000);
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