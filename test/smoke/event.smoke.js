'use strict';

var chai    = require('chai');
var request = require('superagent');

chai.should();
chai.use(require('chai-things'));

var url = 'https://localhost:8080';
var token = '66LOHAiB8Zeod1bAeLYW';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Smoke: Events', function () {
  var server,
      context;

  before(function (done) {
    server = require('../../server.js');
    context = server.init().getContext();
    setTimeout(done, 500);
  });

  after(function (done) {
    context.storage.close();
    context.server.close();
    delete require.cache[server];
    setTimeout(done, 500);
  });

  describe('Flood emit (stable - 100 HTTP-transaction/second)', function () {
    
    it('Subscribe and emit 100 events', function(done){
      var count = 100;
      subscribe(count, done);    
      for (var i = 1; i <= count; emitEvent(i++)){}
    });

    it('Subscribe, emit 100 persistent events and load from event history', function(done){
      afterEach(function(done){
        //Clean-up: delete the created persistent event stream
        request
          .del(url + '/events/history/mystream')
          .set('X-Auth-Token', token)
          .accept('json') 
          .end(function(res){
            res.status.should.be.equal(202);
            res.body.should.have.property('message').and.be.equal('delete accepted');
            done();
          });
      });

      
      var count = 100;      
      //subscribe to event stream
      subscribe(count, function(){

        request
          .get(url + '/events/history/mystream')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function(data){
            data.body.should.to.have.property('results');
            data.body.results.should.be.an('array').and.have.length(100);
            done();
          });

      });
      //emit 100 events
      for (var i = 1; i <= count; emitPersistentEvent(i++)){}
    });

    it('Emit 300 persistent events and load from history', function(done){
      afterEach(function(done){
        //Clean-up: delete the created persistent event stream
        request
          .del(url + '/events/history/mystream')
          .set('X-Auth-Token', token)
          .accept('json') 
          .end(function(res){
            res.status.should.be.equal(202);
            res.body.should.have.property('message').and.be.equal('delete accepted');
            done();
          });
      });

      var count = 100;        
      for (var i = 1; i <= count; emitPersistentEvent(i++)){}
      
      setTimeout(function(){
        for (var i = 1; i <= count; emitPersistentEvent(i++)){}
      }, 1000);

      setTimeout(function(){
        for (var i = 1; i <= count; emitPersistentEvent(i++)){}
      }, 2000);

      setTimeout(function(){

        request
          .get(url + '/events/history/mystream')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function(data){
            data.body.should.to.have.property('results');
            data.body.results.should.be.an('array').and.have.length(300);
            done();
          });

      }, 3000);

    });

  });

  function emitEvent(i) {
    request
      .post(url + '/events/emit/mystream')
      .set('X-Auth-Token', token)
      .send({number: i, foo:'ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum'})
      .accept('json')
      .end(function (res) {
        res.status.should.be.equal(201);
      });
  }

  function emitPersistentEvent(i) {
    request
      .post(url + '/events/emit/mystream')
      .set('x-subkit-event-persistent', true)
      .set('X-Auth-Token', token)
      .send({number: i, foo:'ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum'})
      .accept('json')
      .end(function (res) {
        res.status.should.be.equal(201);
      });
  }

  function subscribe(count, done){
      var req = request
        .get(url + '/events/stream/mystream')
        .set('X-Auth-Token', token)
        .accept('json')
        .parse(function(res) {
          var data = '';
          var events = [];
          res.on('data', function (chunk) {            
            var part = chunk.toString();

            try{
              if(data) {
                events.push(JSON.parse(data)[0]);
                data = '';
              }
              events.push(JSON.parse(part)[0]);
            }catch(e){
              data += part;
            }
            if(events.length === count){
              req.abort();
              done();              
            }                       
          });

        })
        .end();    
  }

});


