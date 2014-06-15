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

describe('Integration: EventSource', function(){
  var server,
      context;

  before(function(done) {
    server = require('../server.js');
    context = server.init().getContext();
    var workerConfig = context.Configuration.get('workerConfig');
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

  describe('on projections', function(){
    it('should create a projection', function(done){
      var task = {
        TaskScript: "{ $init: function(state){ if(!state.count) state.count = 0; }, $complete: function(state){ return state; }, demo: function(state, message){ state.count += 1; return state; } }"
      };
      client.post('/eventsource/projections/demo1', task, function(err, req, res, obj) {
        assert.equal(null, err);
        assert.notEqual(null, obj);
        assert.equal('created', obj.message);
        client.del('/eventsource/projections/demo1', function(err, req, res, obj) {
          assert.equal(null, err);
          assert.notEqual(null, obj);
          done();
        });
      });
    });
  });
});