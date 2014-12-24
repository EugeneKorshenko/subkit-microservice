'use strict';

var assert = require('assert'),
    restify = require('restify');

var client = restify.createJsonClient({
  version: '*',
  rejectUnauthorized: false,
  url: 'https://127.0.0.1:8080',
  headers: {'x-auth-token':'6654edc5-82a3-4006-967f-97d5817d7fe2'}
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
    context.Storage.close();
    context.Server.close();
    delete require.cache[server];
    setTimeout(done, 1000);
  });

  describe('on ...', function(){
    it('should be ...', function(done){
      done();
    });
  });
});