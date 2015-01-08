'use strict';

/*var assert = require('assert');
var restify = require('restify');

var client = restify.createJsonClient({
  version: '*',
  rejectUnauthorized: false,
  url: 'https://127.0.0.1:8080',
  headers: {'x-auth-token':'66LOHAiB8Zeod1bAeLYW'}
});*/

describe('Integration: Store', function(){
  var server,
      context;

  before(function(done) {
    server = require('../server.js');
    context = server.init().getContext();
    done();
  });

  after(function(done){
    context.storage.close();
    context.server.close();
    delete require.cache[server];
    done();
  });

  describe('on ...', function(){
    it('should be ...', function(done){
      done();
    });
  });
});
