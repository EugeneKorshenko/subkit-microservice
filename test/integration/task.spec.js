'use strict';

var assert = require('assert'),
    restify = require('restify'),
    path = require('path');

var client = restify.createJsonClient({
  version: '*',
  rejectUnauthorized: false,
  url: 'https://127.0.0.1:8080',
  headers: {'x-auth-token':'66LOHAiB8Zeod1bAeLYW'}
});

describe('Integration: Task', function(){
  var server,
      context;

  before(function(done) {
    server = require('../../server.js');
    context = server.init().getContext();
    context.task.init({
      tasksPath: path.join(__dirname, './task_mock'),
    });
    done();
  });
  after(function(done){
    context.storage.close();
    context.server.close();
    delete require.cache[server];
    done();
  });

  describe('Manage tasks', function(){
    it('should manage task', function(done){
      client.post('/tasks/demo1', null, function(err, req, res, obj) {
        assert.equal(null, err);
        assert.notEqual(null, obj);
        assert.equal('created', obj.message);
        
        client.get('/tasks/demo1', function(err, req, res, obj){
          assert.equal(null, err);
          assert.notEqual(null, obj); 
          assert.notEqual('', obj.name);

          obj.taskScript = 'task.done(null,{});';
          client.put('/tasks/demo1', obj, function(err, req, res, obj){
            assert.equal(null, err);
            assert.notEqual(null, obj);
            assert.notEqual('', obj.taskScript);
            assert.equal('update accepted', obj.message);

            client.del('/tasks/demo1', function(err, req, res, obj) {
              assert.equal(null, err);
              assert.notEqual(null, obj);
              assert.equal('delete accepted', obj.message);
              done();
            });

          });

        });
      });
    });

    it('should execute error task', function(done){
      client.post('/tasks/error1', null, function(err, req, res, obj) {
        assert.equal(null, err);
        assert.notEqual(null, obj);
        assert.equal('created', obj.message);
        
        client.get('/tasks/error1', function(err, req, res, obj){
          assert.equal(null, err);
          assert.notEqual(null, obj); 
          assert.notEqual('', obj.name);

          obj.taskScript = 'task.done(new Error("Test error occured"));';
          client.put('/tasks/error1', obj, function(err, req, res, obj){
            assert.equal(null, err);
            assert.notEqual(null, obj);
            assert.notEqual('', obj.taskScript);
            assert.equal('update accepted', obj.message);


            client.get('/api/error1', function(err, req, res, obj){
              assert.equal(res.statusCode, 500);
              assert.equal('Test error occured', err.body);
              assert.equal('Test error occured', obj);

              client.del('/tasks/error1', function(err, req, res, obj) {
                assert.equal(null, err);
                assert.notEqual(null, obj);
                assert.equal('delete accepted', obj.message);
                done();
              });

            });

          });

        });
      });
    });

    it('should execute timeout error task', function(done){
      client.post('/tasks/timeout1', null, function(err, req, res, obj) {
        assert.equal(null, err);
        assert.notEqual(null, obj);
        assert.equal('created', obj.message);
        
        client.get('/tasks/timeout1', function(err, req, res, obj){
          assert.equal(null, err);
          assert.notEqual(null, obj); 
          assert.notEqual('', obj.name);

          obj.taskScript = 'setTimeout(function(){task.done();},6000);';
          client.put('/tasks/timeout1', obj, function(err, req, res, obj){
            assert.equal(null, err);
            assert.notEqual(null, obj);
            assert.notEqual('', obj.taskScript);
            assert.equal('update accepted', obj.message);


            client.get('/api/timeout1', function(err, req, res, obj){
              assert.equal(res.statusCode, 500);
              assert.equal('Timeout - timeout1 do not done.', err.body);
              assert.equal('Timeout - timeout1 do not done.', obj);

              client.del('/tasks/timeout1', function(err, req, res, obj) {
                assert.equal(null, err);
                assert.notEqual(null, obj);
                assert.equal('delete accepted', obj.message);
                done();
              });

            });

          });

        });
      });
    });

    it('should execute throw error task', function(done){
      client.post('/tasks/throw1', null, function(err, req, res, obj) {
        assert.equal(null, err);
        assert.notEqual(null, obj);
        assert.equal('created', obj.message);
        
        client.get('/tasks/throw1', function(err, req, res, obj){
          assert.equal(null, err);
          assert.notEqual(null, obj); 
          assert.notEqual('', obj.name);

          obj.taskScript = 'throw new Error("Error thrown");';
          client.put('/tasks/throw1', obj, function(err, req, res, obj){
            assert.equal(null, err);
            assert.notEqual(null, obj);
            assert.notEqual('', obj.taskScript);
            assert.equal('update accepted', obj.message);


            client.get('/api/throw1', function(err, req, res, obj){
              assert.equal(res.statusCode, 500);
              assert.equal('Error thrown', err.body);
              assert.equal('Error thrown', obj);

              client.del('/tasks/throw1', function(err, req, res, obj) {
                assert.equal(null, err);
                assert.notEqual(null, obj);
                assert.equal('delete accepted', obj.message);
                done();
              });

            });

          });

        });
      });
    });

  });

});