'use strict';

var assert = require('assert'),
    restify = require('restify');

var client = restify.createJsonClient({
  version: '*',
  url: 'http://127.0.0.1:8080',
  headers: {'api_key':'6654edc5-82a3-4006-967f-97d5817d7fe2'}
});

describe('Integration: Manage', function(){
  var server,
      context;
  before(function(done) {
    server = require('../server.js');
    context = server.init().getContext();
    done();
  });
  after(function(done){
    context.Server.close();
    context.Storage.close();
    delete require.cache[server];
    done();
  });

  describe('on ...', function(){
    it('should be ...', function(done){
      done();
    });
  });
});