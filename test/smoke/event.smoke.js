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

  describe('Flood emit (stable)', function () {
    
    it('Subscribe and emit 100 events in a second', function(done){
      var count = 100; //stable with max 100 emits per second
      subscribe(count, done);    
      for (var i = 1; i <= count; emitEvent(i++)){}
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


