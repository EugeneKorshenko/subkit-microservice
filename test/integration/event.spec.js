'use strict';

var assert = require('assert');
var restify = require('restify');

describe('Integration: Event', function(){
  var server,
      context;

  before(function(done) {
    server = require('../../server.js');
    context = server.init().getContext();
    done();
  });

  after(function(done){
    context.storage.close();
    context.server.close();
    delete require.cache[server];
    setTimeout(done, 1000);
  });

  describe('on bind via webhook', function(){
    it('should call a bound webhook', function(done){
    var client = restify.createJsonClient({
      rejectUnauthorized: false,
      url: 'https://127.0.0.1:8080',
      headers: {
        'x-auth-token':'66LOHAiB8Zeod1bAeLYW',
        'x-subkit-event-webhook': 'https://127.0.0.1:8080/stores/events',
        'x-subkit-event-apikey': '66LOHAiB8Zeod1bAeLYW'
      }
    });
    client.post('/events/bind/eventstream1', {}, function(error, req, res, actual){
      assert.ifError(error);
      assert.equal(actual.message, 'created');

      client.post('/events/emit/eventstream1', {content:'a'}, function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(actual.message, 'emitted');

        client.del('/events/bind/eventstream1', function(error, req, res, actual){
          assert.ifError(error);
          assert.equal(actual.message, 'delete accepted');
          done(); 
        }); 
      });
    });
    });

    it('should call bound webhook when filter match', function(done){
    var client = restify.createJsonClient({
      rejectUnauthorized: false,
      url: 'https://127.0.0.1:8080',
      headers: {
        'x-auth-token':'66LOHAiB8Zeod1bAeLYW',
        'x-subkit-event-webhook': 'https://127.0.0.1:8080/stores/events1',
        'x-subkit-event-apikey': '66LOHAiB8Zeod1bAeLYW',
        'x-subkit-event-filter': JSON.stringify({content:'b'})
      }
    });     
    client.post('/events/bind/eventstream1', {}, function(error, req, res, actual){
      assert.ifError(error);
      assert.equal(actual.message, 'created');

      client.post('/events/emit/eventstream1', {content:'b'}, function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(actual.message, 'emitted');

        client.del('/events/bind/eventstream1', function(error, req, res, actual){
          assert.ifError(error);
          assert.equal(actual.message, 'delete accepted');
          done(); 
        });
      });
    });
    });

    it('should not call bound webhook when filter not match', function(done){
    var client = restify.createJsonClient({
      rejectUnauthorized: false,
      url: 'https://127.0.0.1:8080',
      headers: {
        'x-auth-token':'66LOHAiB8Zeod1bAeLYW',
        'x-subkit-event-webhook': 'https://127.0.0.1:8080/stores/events2',
        'x-subkit-event-apikey': '66LOHAiB8Zeod1bAeLYW',
        'x-subkit-event-filter': JSON.stringify({content:'c'})
      }
    });     
    client.post('/events/bind/eventstream1', {}, function(error, req, res, actual){
      assert.ifError(error);
      assert.equal(actual.message, 'created');

      client.post('/events/emit/eventstream1', {content:'notmatch'}, function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(actual.message, 'emitted');

        client.del('/events/bind/eventstream1', function(error, req, res, actual){
          assert.ifError(error);
          assert.equal(actual.message, 'delete accepted');
          done(); 
        });
        
      });
    });       
    });

  });
});