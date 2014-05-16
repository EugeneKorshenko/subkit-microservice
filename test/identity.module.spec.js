'use strict';

var assert = require('assert'),
    path = require('path'),
    store,
    sut;

describe('Module: Identity', function(){
  before(function(done) {
    store = require('../lib/store.module.js').init({
      dbPath:'./identityspecdb',
      rightsPath:'./rights.json',
      tasksPath:'./tasks',
      backupPath:'./backups'
    });
    sut = require('../lib/identity.module.js').init('account', store);
    done();
  });
  after(function(done){
    store.destroy(done);
  });
  
  describe('on ...', function(){
    it('should be ...', function(done){
      done();
    });
  });
});