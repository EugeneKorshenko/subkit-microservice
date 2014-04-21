'use strict';

var assert = require('assert');

describe('Module: EventSource', function(){
  var store, sut;

  before(function(done) {
    store = require('../lib/store.module.js').init({
      dbPath:'./eventsourcedb',
      rightsPath:'./rights.json',
      backupPath:'./backups'
    });
    var pubsub = require('../lib/pubsub.module.js').init({pollInterval: 1});
    sut = require('../lib/eventsource.module.js').init(store, pubsub);
    done();
  });
  after(function(done){
    store.destroy(console.log);
    done();
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