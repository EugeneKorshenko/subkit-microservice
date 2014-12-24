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

describe.skip('Integration: Task', function(){
  var server,
      context;

  before(function(done) {
    server = require('../server.js');
    context = server.init().getContext();
    context.Task.init({
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

  describe('Manage tasks', function(){
    it('should manage task', function(done){
      client.post('/task/demo1', null, function(err, req, res, obj) {
        assert.equal(null, err);
        assert.notEqual(null, obj);
        assert.equal('created', obj.message);
        
        client.get('/task/demo1', function(err, req, res, obj){
          assert.equal(null, err);
          assert.notEqual(null, obj); 
          assert.notEqual('', obj.Name);

          obj.TaskScript = 'response(null,{});';
          client.put('/task/demo1', obj, function(err, req, res, obj){
            assert.equal(null, err);
            assert.notEqual(null, obj);
            assert.notEqual('', obj.TaskScript);
            assert.equal('changed', obj.message);

            client.del('/task/demo1', function(err, req, res, obj) {
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