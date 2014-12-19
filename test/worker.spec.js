'use strict';

var assert = require('assert'),
    restify = require('restify'),
    path = require('path');

var client = restify.createJsonClient({
  version: '*',
  rejectUnauthorized: false,
  url: 'https://127.0.0.1:8080',
  headers: {'x-auth-token':'6654edc5-82a3-4006-967f-97d5817d7fe2'}
});

describe.skip('Integration: Worker', function(){
  var server,
      context;

  before(function(done) {
    server = require('../server.js');
    context = server.init().getContext();
    context.Worker.init({
      tasksPath: path.join(__dirname, './task_mock'),
    });
    done();
  });
  after(function(done){
    context.Storage.close();
    context.Server.close();
    delete require.cache[server];
    done();
  });

  describe('manage workers', function(){
    it('should manage worker', function(done){
      client.post('/worker/demo1', null, function(err, req, res, obj) {
        assert.equal(null, err);
        assert.notEqual(null, obj);
        assert.equal('created', obj.message);
        
        client.get('/worker/demo1', function(err, req, res, obj){
          assert.equal(null, err);
          assert.notEqual(null, obj); 
          assert.notEqual('', obj.Name);

          obj.TaskScript = "response(null,{});";
          client.put('/worker/demo1', obj, function(err, req, res, obj){
            assert.equal(null, err);
            assert.notEqual(null, obj);
            assert.notEqual('', obj.TaskScript);
            assert.equal('changed', obj.message);

            client.del('/worker/demo1', function(err, req, res, obj) {
              assert.equal(null, err);
              assert.notEqual(null, obj);
              assert.equal('removed', obj.message);
              done();
            });

          });

        });
      });
    });
  });

});