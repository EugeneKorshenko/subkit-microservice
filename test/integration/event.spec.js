'use strict';

var _       = require('underscore');
var Promise = require("bluebird");

var chai = require('chai');
var expect = chai.expect;
var request = require('superagent');
var uuid = require('uuid');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-array'));

var url = 'https://localhost:8080';
var token = '66LOHAiB8Zeod1bAeLYW';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Integration: Event', function(){
  var server,
      context;

  before(function (done) {
    server = require('../../server.js');
    context = server.init().getContext();
    done();
  });

  after(function (done) {
    context.storage.close();
    context.server.close();
    delete require.cache[server];
    setTimeout(done, 1000);
  });

  describe('Get available event-streams:', function () {

    it('#GET with wrong "X-Auth-Token" header should response 401', function (done) {
      request
        .get(url + '/events/streams')
        .set('X-Auth-Token', 'wrong_token')
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(401);
          done();
        });
    });

    it('#GET without "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/events/streams')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('If there is no one active stream it should return at least one stream "heartbeat"', function(done) {
      request
        .get(url + '/events/streams')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(200);
          res.body.should.be.an('array');
          res.body.should.include.something.that.deep.equals({stream: 'heartbeat'});

          done();
        });
    });

    it('If there is an active stream it should return at least two streams "heartbeat" and active one', function(done) {
      request
        .post(url + '/events/emit/mystream')
        .set('X-Auth-Token', token)
        .send({Msg:'Hello Subkit!', Number: 1})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          request
            .get(url + '/events/streams')
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(200);
              res.body.should.be.an('array');
              res.body.should.include.something.that.deep.equals({stream: 'heartbeat'}, {stream: 'mystream'});
              done();
            });
        });
    });

    it('If there is an active stream result it should contain that stream', function(done) {
      request
        .post(url + '/events/emit/teststream')
        .set('X-Auth-Token', token)
        .send({Msg:'Hello Subkit!', Number: 1})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          request
            .get(url + '/events/streams')
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(200);
              res.body.should.be.an('array');
              var streams = [];
              for (var i = 0; i < res.body.length; i++) {
                res.body[i].should.have.property('stream');
                streams.push(res.body[i].stream);
              }
              streams.should.include.members(['teststream']);
              done();
            });
        });
    });

    it('If there is more than one active stream result it should return all of them', function(done) {
      request
        .post(url + '/events/emit/teststream')
        .set('X-Auth-Token', token)
        .send({Msg:'Hello Subkit!', Number: 1})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          request
            .post(url + '/events/emit/teststream1')
            .set('X-Auth-Token', token)
            .send({Msg: 'Hello Subkit!', Number: 1})
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(201);
              request
                .get(url + '/events/streams')
                .set('X-Auth-Token', token)
                .accept('json')
                .end(function (res) {
                  res.status.should.be.equal(200);
                  res.body.should.be.an('array');
                  var streams = [];
                  for (var i = 0; i < res.body.length; i++) {
                    res.body[i].should.have.property('stream');
                    streams.push(res.body[i].stream);
                  }
                  streams.should.include.members(['teststream','teststream1']);
                  done();
                });
            });
        });
    });
  });

  describe('Subscribe to specific event stream (Transfer-Encoding: chunked):', function(){

    it('#GET with wrong "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/events/stream/unique_test_stream')
        .set('X-Auth-Token', 'wrong_token')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('#GET without "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/events/stream/unique_test_stream')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('Should receive message from specified stream', function(done) {
      var req = request
        .get(url + '/events/stream/unique_test_stream')
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          res.on('data', function (chunk) {
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);
            event[0].should.include.keys(['$name', '$stream', '$persistent', '$key', '$metadata', '$payload']);
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Msg').and.be.equal('Hello Subkit!');
            event.should.have.deep.property('[0].$name').to.be.equal('unique_test_stream');
            event.should.have.deep.property('[0].$stream').to.be.equal('unique_test_stream');
            event.should.have.deep.property('[0].$persistent').to.be.false;
            event.should.have.deep.property('[0].$key').to.be.an('number');
            event.should.have.deep.property('[0].$metadata').to.be.an('object');
            event.should.have.deep.property('[0].$timestamp');
            req.abort();
            done();
          });
        })
        .end();

      request
        .post(url + '/events/emit/unique_test_stream')
        .set('X-Auth-Token', token)
        .send({Msg:'Hello Subkit!', Number: 1})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
        });
    });

    it('Should receive three messages from specified streams', function(done) {
      var req = request
        .get(url + '/events/stream/another_unique_test_stream')
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          var event_number = 0;
          res.on('data', function (chunk) {
            event_number++;
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);
            event[0].should.include.keys(['$name', '$stream', '$persistent', '$key', '$metadata', '$payload']);
            event[0].$payload.should.include.keys(['Msg', 'Number']);
            expect(['Event #1', 'Event #2', 'Event #3']).to.include(event[0].$payload.Msg);
            expect([1, 2, 3]).to.include(event[0].$payload.Number);
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Msg').and.be.equal('Event #' + event_number.toString());
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Number').and.be.equal(event_number);
            event.should.have.deep.property('[0].$name').to.be.equal('another_unique_test_stream');
            event.should.have.deep.property('[0].$stream').to.be.equal('another_unique_test_stream');
            event.should.have.deep.property('[0].$persistent').to.be.false;
            event.should.have.deep.property('[0].$key').to.be.an('number');
            event.should.have.deep.property('[0].$metadata').to.be.an('object');
            event.should.have.deep.property('[0].$timestamp');
            if (event_number === 3) {
              req.abort();
              done();
            }
          });
        })
        .end();

      request
        .post(url + '/events/emit/another_unique_test_stream')
        .set('X-Auth-Token', token)
        .send({Msg:'Event #1', Number: 1})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          request
            .post(url + '/events/emit/another_unique_test_stream')
            .set('X-Auth-Token', token)
            .send({Msg:'Event #2', Number: 2})
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              request
                .post(url + '/events/emit/another_unique_test_stream')
                .set('X-Auth-Token', token)
                .send({Msg:'Event #3', Number: 3})
                .accept('json')
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                });
            });
        });
    });

    it('Should receive three messages from specified streams with window size equal to 3', function(done) {
      var req = request
        .get(url + '/events/stream/another_unique_test_stream/?size=3')
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          var event_number = 0;
          res.on('data', function (chunk) {
            event_number++;
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(event_number);
            event[0].should.include.keys(['$name', '$stream', '$persistent', '$key', '$metadata', '$payload']);
            event[0].$payload.should.include.keys(['Msg', 'Number']);
            expect(['Event #1', 'Event #2', 'Event #3']).to.include(event[0].$payload.Msg);
            expect([1, 2, 3]).to.include(event[0].$payload.Number);
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Msg').and.be.equal('Event #' + event_number.toString());
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Number').and.be.equal(event_number);
            event.should.have.deep.property('[0].$name').to.be.equal('another_unique_test_stream');
            event.should.have.deep.property('[0].$stream').to.be.equal('another_unique_test_stream');
            event.should.have.deep.property('[0].$persistent').to.be.false;
            event.should.have.deep.property('[0].$key').to.be.an('number');
            event.should.have.deep.property('[0].$metadata').to.be.an('object');
            event.should.have.deep.property('[0].$timestamp');
            if (event_number === 3) {
              req.abort();
              done();
            }
          });
        })
        .end();

      request
        .post(url + '/events/emit/another_unique_test_stream')
        .set('X-Auth-Token', token)
        .send({Msg:'Event #1', Number: 1})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          request
            .post(url + '/events/emit/another_unique_test_stream')
            .set('X-Auth-Token', token)
            .send({Msg:'Event #2', Number: 2})
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              request
                .post(url + '/events/emit/another_unique_test_stream')
                .set('X-Auth-Token', token)
                .send({Msg:'Event #3', Number: 3})
                .accept('json')
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                });
            });
        });
    });

    it('Should receive three messages from specified streams with window size equal to 3 in FIFO order', function(done) {
      var req = request
        .get(url + '/events/stream/another_unique_test_stream/?size=3&order=ascending')
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          var event_number = 0;
          res.on('data', function (chunk) {
            event_number++;
            var event = JSON.parse(chunk.toString());
            
            event.should.be.an('array').and.have.length(event_number);
            event[0].should.include.keys(['$name', '$stream', '$persistent', '$key', '$metadata', '$payload']);
            event[0].$payload.should.include.keys(['Msg', 'Number']);
            expect(['Event #1', 'Event #2', 'Event #3']).to.include(event[event_number - 1].$payload.Msg);
            expect([1, 2, 3]).to.include(event[event_number - 1].$payload.Number);
            event.should.have.deep.property('[' + (event_number - 1) + '].$payload').to.be.an('object').and.have.property('Msg').and.be.equal('Event #' + event_number.toString());
            event.should.have.deep.property('[' + (event_number - 1) + '].$payload').to.be.an('object').and.have.property('Number').and.be.equal(event_number);
            event.should.have.deep.property('[' + (event_number - 1) + '].$name').to.be.equal('another_unique_test_stream');
            event.should.have.deep.property('[' + (event_number - 1) + '].$stream').to.be.equal('another_unique_test_stream');
            event.should.have.deep.property('[' + (event_number - 1) + '].$persistent').to.be.false;
            event.should.have.deep.property('[' + (event_number - 1) + '].$key').to.be.an('number');
            event.should.have.deep.property('[' + (event_number - 1) + '].$metadata').to.be.an('object');
            event.should.have.deep.property('[' + (event_number - 1) + '].$timestamp');
            if (event_number === 3) {
              req.abort();
              done();
            }
          });
        })
        .end();

      request
        .post(url + '/events/emit/another_unique_test_stream')
        .set('X-Auth-Token', token)
        .send({Msg:'Event #1', Number: 1})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          request
            .post(url + '/events/emit/another_unique_test_stream')
            .set('X-Auth-Token', token)
            .send({Msg:'Event #2', Number: 2})
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              request
                .post(url + '/events/emit/another_unique_test_stream')
                .set('X-Auth-Token', token)
                .send({Msg:'Event #3', Number: 3})
                .accept('json')
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                });
            });
        });
    });

    it('Should receive three messages from specified streams with window size equal to 1 in FIFO order', function(done) {
      var req = request
        .get(url + '/events/stream/another_unique_test_stream/?order=ascending')
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          var event_number = 0;
          res.on('data', function (chunk) {
            event_number++;
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);
            event[0].should.include.keys(['$name', '$stream', '$persistent', '$key', '$metadata', '$payload']);
            event[0].$payload.should.include.keys(['Msg', 'Number']);
            expect(['Event #1', 'Event #2', 'Event #3']).to.include(event[0].$payload.Msg);
            expect([1, 2, 3]).to.include(event[0].$payload.Number);
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Msg').and.be.equal('Event #' + event_number.toString());
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Number').and.be.equal(event_number);
            event.should.have.deep.property('[0].$name').to.be.equal('another_unique_test_stream');
            event.should.have.deep.property('[0].$stream').to.be.equal('another_unique_test_stream');
            event.should.have.deep.property('[0].$persistent').to.be.false;
            event.should.have.deep.property('[0].$key').to.be.an('number');
            event.should.have.deep.property('[0].$metadata').to.be.an('object');
            event.should.have.deep.property('[0].$timestamp');
            if (event_number === 3) {
              req.abort();
              done();
            }
          });

        })
        .end();

      request
        .post(url + '/events/emit/another_unique_test_stream')
        .set('X-Auth-Token', token)
        .send({Msg:'Event #1', Number: 1})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          request
            .post(url + '/events/emit/another_unique_test_stream')
            .set('X-Auth-Token', token)
            .send({Msg:'Event #2', Number: 2})
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              request
                .post(url + '/events/emit/another_unique_test_stream')
                .set('X-Auth-Token', token)
                .send({Msg:'Event #3', Number: 3})
                .accept('json')
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                });
            });
        });
    });
  });

  describe('Subscribe to specific event stream with filter (Transfer-Encoding: chunked):', function(){

    it('Server should not hangs up on wrong filter queries', function(done) {
      request
        .get(url + '/events/stream/another_unique_test_stream')
        .query({where: 'wrong'})
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(400);
          done();
        });
    });

    it('Should receive two of three messages from specified streams with payload.Number', function(done) {
      var filter = {'payload.Number': {$exists:true}};

      var req = request
        .get(url + '/events/stream/another_unique_test_stream')
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          res.on('data', function (chunk) {
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);
            event[0].should.include.keys(['$name', '$stream', '$persistent', '$key', '$metadata', '$payload', '$timestamp']);
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Number').and.be.equal(3);
            req.abort();
            done();
          });
        })
        .end();

      request
        .post(url + '/events/emit/another_unique_test_stream')
        .set('X-Auth-Token', token)
        .send({Msg:'Event #1'})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          request
            .post(url + '/events/emit/another_unique_test_stream')
            .set('X-Auth-Token', token)
            .send({Msg:'Event #2'})
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              request
                .post(url + '/events/emit/another_unique_test_stream')
                .set('X-Auth-Token', token)
                .send({Msg:'Event #3', Number: 3})
                .accept('json')
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                });
            });
        });
    });

    it('Should receive two of three messages from specified streams without payload.Number', function(done) {
      var filter = {'payload.Number': {$exists:false}};

      var req = request
        .get(url + '/events/stream/another_unique_test_stream')
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          res.on('data', function (chunk) {
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);
            event[0].should.include.keys(['$name', '$stream', '$persistent', '$key', '$metadata', '$payload', '$timestamp']);
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.not.have.property('Number');
            req.abort();
            done();
          });
        })
        .end();

      request
        .post(url + '/events/emit/another_unique_test_stream')
        .set('X-Auth-Token', token)
        .send({Msg:'Event #1', Number: 1})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          request
            .post(url + '/events/emit/another_unique_test_stream')
            .set('X-Auth-Token', token)
            .send({Msg:'Event #2', Number: 2})
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              request
                .post(url + '/events/emit/another_unique_test_stream')
                .set('X-Auth-Token', token)
                .send({Msg:'Event #3'})
                .accept('json')
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                });
            });
        });
    });

    it('Should receive two of three messages from specified streams with payload.Number: {"$in": [2]}', function(done) {
      var filter = {'payload.Number': {$in: [2]}};

      var req = request
        .get(url + '/events/stream/another_unique_test_stream')
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          res.on('data', function (chunk) {
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);
            event[0].should.include.keys(['$name', '$stream', '$persistent', '$key', '$metadata', '$payload', '$timestamp']);
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Number').and.be.equal(2);
            req.abort();
            done();
          });
        })
        .end();

      request
        .post(url + '/events/emit/another_unique_test_stream')
        .set('X-Auth-Token', token)
        .send({Msg:'Event #1', Number: 1})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          request
            .post(url + '/events/emit/another_unique_test_stream')
            .set('X-Auth-Token', token)
            .send({Msg:'Event #2', Number: 2})
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              request
                .post(url + '/events/emit/another_unique_test_stream')
                .set('X-Auth-Token', token)
                .send({Msg:'Event #3'})
                .accept('json')
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                });
            });
        });
    });

    it('Should receive two of three messages from specified streams with {$or: [{"payload.Number": {"$in": [2]}}, {"Msg": {"$in": [\'Event #3\']}}]}', function(done) {
      var filter = {$or: [{'payload.Number': {$in: [2]}}, {Msg: {$in: ['Event #3']}}]};

      var req = request
        .get(url + '/events/stream/another_unique_test_stream')
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          res.on('data', function (chunk) {
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);
            event[0].should.include.keys(['$name', '$stream', '$persistent', '$key', '$metadata', '$payload', '$timestamp']);
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Wrong').to.be.false;
            req.abort();
            done();
          });
        })
        .end();

      request
        .post(url + '/events/emit/another_unique_test_stream')
        .set('X-Auth-Token', token)
        .send({Msg:'Event #1', Number: 1, Wrong: true})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          request
            .post(url + '/events/emit/another_unique_test_stream')
            .set('X-Auth-Token', token)
            .send({Msg:'Event #2', Number: 2, Wrong: false})
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              request
                .post(url + '/events/emit/another_unique_test_stream')
                .set('X-Auth-Token', token)
                .send({Msg:'Event #3', Wrong: false})
                .accept('json')
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                });
            });
        });
    });
  });

  describe('Subscribe to event streams with filter (Transfer-Encoding: chunked):', function() {

    it('#GET with wrong "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/events/stream')
        .set('X-Auth-Token', 'wrong_token')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('#GET without "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/events/stream')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('Server should not hangs up on wrong filter queries', function(done) {
      request
        .get(url + '/events/stream')
        .query({where: 'wrong'})
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(400);
          done();
        });
    });

    it('Should receive all messages where matching JSONQuery `{$or: [{stream: "A-Stream"}, {stream: "B-Stream"}]}` ', function (done) {
      var filter = {$or: [{stream: 'A-Stream'}, {stream: 'B-Stream'}]};

      var req = request
        .get(url + '/events/stream')
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          var event_number = 0;
          res.on('data', function (chunk) {
            event_number++;
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);
            
            if(event_number === 1){
              event.should.have.deep.property('[0].$stream').and.be.equal('A-Stream');
            }
            if(event_number === 2){
              event.should.have.deep.property('[0].$stream').and.be.equal('B-Stream');
            }
            
            if (event_number === 2) {
              req.abort();
              done();
            }
          });
        })
        .end();

      request
        .post(url + '/events/emit/A-Stream')
        .set('X-Auth-Token', token)
        .accept('json')
        .send({Msg: 'Event #1', Number: 1})
        .end(function () {
          request
            .post(url + '/events/emit/B-Stream')
            .set('X-Auth-Token', token)
            .accept('json')
            .send({Msg: 'Event #1', Number: 1})
            .end();
        });
    });

    it('Should receive all messages where matching JSONQuery `{stream: "A-Stream"}` ', function (done) {
      var filter = {stream: 'A-Stream'};

      var req = request
        .get(url + '/events/stream')
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          var event_number = 0;
          res.on('data', function (chunk) {
            event_number++;
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);

            if(event_number === 1){
              event.should.have.deep.property('[0].$stream').and.be.equal('A-Stream');
              req.abort();
              done();
            }

           });
        })
        .end();

      request
        .post(url + '/events/emit/B-Stream')
        .set('X-Auth-Token', token)
        .accept('json')
        .send({Msg: 'Event #1', Number: 1})
        .end(function () {
          request
            .post(url + '/events/emit/A-Stream')
            .set('X-Auth-Token', token)
            .accept('json')
            .send({Msg: 'Event #1', Number: 1})
            .end();
        });
    });

    it('Should receive all messages where matching JSONQuery `{stream: "A-Stream"}` and window size = 2', function (done) {
      var filter = {stream: 'A-Stream'};

      var req = request
        .get(url + '/events/stream')
        .query({size: 2})
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          var event_number = 0;
          res.on('data', function (chunk) {
            event_number++;
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array');
            event.should.not.include.something.that.deep.equals({stream: 'B-Stream'});
            if (event_number === 2) {
              req.abort();
              done();
            }
          });
        })
        .end();

      request
        .post(url + '/events/emit/A-Stream')
        .set('X-Auth-Token', token)
        .accept('json')
        .send({Msg: 'Event #1', Number: 1})
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          request
            .post(url + '/events/emit/B-Stream')
            .set('X-Auth-Token', token)
            .accept('json')
            .send({Msg: 'Event #1', Number: 1})
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              request
                .post(url + '/events/emit/A-Stream')
                .set('X-Auth-Token', token)
                .accept('json')
                .send({Msg: 'Event #2', Number: 2})
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                });
            });
        });
    });

    it('Should receive all messages where matching JSONQuery `{$and: [{stream: \'A-Stream\'}, {"payload.Number": 2}]}` and window size = 2', function (done) {
      var filter = {$and: [{stream: 'A-Stream'}, {'payload.Number': 2}]};

      var req = request
        .get(url + '/events/stream')
        .query({size: 2})
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          var event_number = 0;
          res.on('data', function (chunk) {
            event_number++;
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array');
            event.should.not.include.something.that.deep.equals({stream: 'B-Stream'});
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Number').to.be.equal(2);
            if (event_number === 2) {
              req.abort();
              done();
            }
          });
        })
        .end();

      request
        .post(url + '/events/emit/A-Stream')
        .set('X-Auth-Token', token)
        .accept('json')
        .send({Msg: 'Event #1', Number: 2})
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          request
            .post(url + '/events/emit/B-Stream')
            .set('X-Auth-Token', token)
            .accept('json')
            .send({Msg: 'Event #2', Number: 1})
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              request
                .post(url + '/events/emit/A-Stream')
                .set('X-Auth-Token', token)
                .accept('json')
                .send({Msg: 'Event #3', Number: 3})
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                  request
                    .post(url + '/events/emit/A-Stream')
                    .set('X-Auth-Token', token)
                    .accept('json')
                    .send({Msg: 'Event #4', Number: 2})
                    .end(function (res) {
                      res.status.should.be.equal(201);
                      res.body.should.have.property('message').and.be.equal('emitted');
                    });
                });
            });
        });
    });

    it.skip('Should receive all persistent messages where matching JSONQuery `{$and: [{stream: \'A-Stream\'}, {"payload.Number": 2}]}` and window size = 2', function (done) {
      var filter = {$and: [{stream: 'A-Stream'}, {'payload.Number': 2}, {persistent: true}]};

      var req = request
        .get(url + '/events/stream')
        .query({size: 2})
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          var event_number = 0;
          res.on('data', function (chunk) {
            event_number++;
            var event = JSON.parse(chunk.toString());
            console.log('Receive event: ',event);
            event.should.be.an('array');
            event.should.not.include.something.that.deep.equals({stream: 'B-Stream'});
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Number').to.be.equal(2);
            event.should.have.deep.property('[0].$persistent').to.be.equal('true');
            if (event_number === 2) {
              req.abort();
              done();
            }
          });
        })
        .end();

      request
        .post(url + '/events/emit/A-Stream')
        .set('X-Auth-Token', token)
        .set('x-subkit-event-persistent', true)
        .accept('json')
        .send({Msg: 'Event #1', Number: 2})
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          console.log({stream: 'A-Stream', Msg: 'Event #1', Number: 2, Persistent: true});
          request
            .post(url + '/events/emit/B-Stream')
            .set('X-Auth-Token', token)
            .accept('json')
            .send({Msg: 'Event #2', Number: 1})
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              console.log({stream: 'B-Stream', Msg: 'Event #2', Number: 1});
              request
                .post(url + '/events/emit/A-Stream')
                .set('X-Auth-Token', token)
                .accept('json')
                .send({Msg: 'Event #3', Number: 3})
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                  console.log({stream: 'A-Stream', Msg: 'Event #3', Number: 3});
                  request
                    .post(url + '/events/emit/A-Stream')
                    .set('X-Auth-Token', token)
                    .accept('json')
                    .send({Msg: 'Event #4', Number: 2})
                    .end(function (res) {
                      res.status.should.be.equal(201);
                      res.body.should.have.property('message').and.be.equal('emitted');
                      console.log({stream: 'A-Stream', Msg: 'Event #4', Number: 2});
                      request
                        .post(url + '/events/emit/A-Stream')
                        .set('X-Auth-Token', token)
                        .set('x-subkit-event-persistent', true)
                        .accept('json')
                        .send({Msg: 'Event #5', Number: 2})
                        .end(function (res) {
                          res.status.should.be.equal(201);
                          res.body.should.have.property('message').and.be.equal('emitted');
                          console.log({stream: 'A-Stream', Msg: 'Event #5', Number: 2, Persistent: true});
                        });
                    });
                });
            });
        });
    });
  });

  describe('Emit an event:', function(){

    it('Request with wrong "X-Auth-Token" header should response 401', function(done) {
      request
        .post(url + '/events/emit/news')
        .set('X-Auth-Token', 'wrong_tocken')
        .send({Title:'New test has been created', Body: 'The new test for event emission has been created today :)', Moment: '29.04.2015 12:27'})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(401);
          done();
        });
    });

    it('Request without "X-Auth-Token" header should response 401', function(done) {
      request
        .post(url + '/events/emit/news')
        .send({Title:'New test has been created', Body: 'The new test for event emission has been created today :)', Moment: '29.04.2015 12:27'})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(401);
          done();
        });
    });

    it('It should emit an event within `news` stream', function(done) {

      var req = request
        .get(url + '/events/stream/news')
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          res.on('data', function (chunk) {
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);
            event[0].should.include.keys(['$name', '$stream', '$persistent', '$key', '$metadata', '$payload']);
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.include.keys(['Title', 'Body', 'Moment']);
            event.should.have.deep.property('[0].$payload.Title').to.be.equal('New test has been created');
            event.should.have.deep.property('[0].$payload.Body').to.be.equal('The new test for event emission has been created today :)');
            event.should.have.deep.property('[0].$payload.Moment').to.be.equal('29.04.2015 12:27');
            event.should.have.deep.property('[0].$persistent').to.be.false;
            req.abort();
            done();
          });
        })
        .end();

      request
        .post(url + '/events/emit/news')
        .set('X-Auth-Token', token)
        .send({
          Title:'New test has been created',
          Body: 'The new test for event emission has been created today :)',
          Moment: '29.04.2015 12:27'
        })
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
        });
    });
  });

  describe('Emit a persistent event:', function(){

    it('Request with wrong "X-Auth-Token" header should response 401', function(done) {
      request
        .post(url + '/events/emit/news')
        .set('X-Auth-Token', 'wrong_tocken')
        .set('x-subkit-event-persistent', true)
        .send({Title:'New test has been created', Body: 'The new test for event emission has been created today :)', Moment: '29.04.2015 12:27'})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(401);
          done();
        });
    });

    it('Request without "X-Auth-Token" header should response 401', function(done) {
      request
        .post(url + '/events/emit/news')
        .set('x-subkit-event-persistent', true)
        .send({Title:'New test has been created', Body: 'The new test for event emission has been created today :)', Moment: '29.04.2015 12:27'})
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(401);
          done();
        });
    });

    it('It should emit a persistent event within `news` stream and receive the event', function(done) {
      var req = request
        .get(url + '/events/stream/persistent_news')
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          res.on('data', function (chunk) {
            //check receive event via subscription
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);
            event[0].should.include.keys(['$name', '$stream', '$persistent', '$key', '$metadata', '$payload']);
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.include.keys(['Title', 'Body', 'Moment']);
            event.should.have.deep.property('[0].$payload.Title').to.be.equal('New test has been created');
            event.should.have.deep.property('[0].$payload.Body').to.be.equal('The new test for event emission has been created today :)');
            event.should.have.deep.property('[0].$payload.Moment').to.be.equal('29.04.2015 12:27');
            event.should.have.deep.property('[0].$persistent').to.be.equal('true');
            req.abort();
            done();
          });
        })
        .end();

      request
        .post(url + '/events/emit/persistent_news')
        .set('X-Auth-Token', token)
        .set('x-subkit-event-persistent', true)
        .send({
          Title:'New test has been created',
          Body: 'The new test for event emission has been created today :)',
          Moment: '29.04.2015 12:27'
        })
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
        });
    });
  });

  describe('Read event history (stream-log):', function(){

    beforeEach(function(done){
      //Clean-up: delete the created persistent event stream
      request
        .del(url + '/events/history/persistent_news')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('delete accepted');
          done();
        });
    });

    afterEach(function(done){
      //Clean-up: delete the created persistent event stream
      request
        .del(url + '/events/history/persistent_news')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('delete accepted');
          done();
        });
    });

    it('It should emit a persistent event within `news` stream and load it from history', function(done) {
      request
        .post(url + '/events/emit/persistent_news')
        .set('X-Auth-Token', token)
        .set('x-subkit-event-persistent', true)
        .send({
          Title:'New test has been created',
          Body: 'The new test for event emission has been created today :)',
          Moment: '29.04.2015 12:27'
        })
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          request
            .get(url + '/events/history/persistent_news')
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function(data){
              //check receive event stream history (event-log)
              data.body.should.to.have.property('results');
              data.body.results.should.be.an('array').and.have.length(1);
              done();
            });
      });
    });
  });

  describe('Delete event history (stream-log):', function(){

    beforeEach(function(done){
      //Clean-up: delete the created persistent event stream
      request
        .del(url + '/events/history/persistent_news')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('delete accepted');
          done();
        });
    });

    afterEach(function(done){
      //Clean-up: delete the created persistent event stream
      request
        .del(url + '/events/history/persistent_news')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('delete accepted');
          done();
        });
    });

    it('It should delete event history', function(done) {
      request
        .post(url + '/events/emit/persistent_news')
        .set('X-Auth-Token', token)
        .set('x-subkit-event-persistent', true)
        .send({
          Title:'New test has been created',
          Body: 'The new test for event emission has been created today :)',
          Moment: '29.04.2015 12:27'
        })
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('emitted');
          request
            .get(url + '/events/history/persistent_news')
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function(data){
              //check receive event stream history (event-log)
              data.body.should.to.have.property('results');
              data.body.results.should.be.an('array').and.have.length(1);
              request
                .del(url + '/events/history/persistent_news')
                .set('X-Auth-Token', token)
                .accept('json')
                .end(function(res){
                  res.status.should.be.equal(202);
                  res.body.should.have.property('message').and.be.equal('delete accepted');
                  request
                    .get(url + '/events/history/persistent_news')
                    .set('X-Auth-Token', token)
                    .accept('json')
                    .end(function(data) {
                      //check receive event stream history (event-log)
                      data.body.should.to.have.property('results');
                      data.body.results.should.be.an('array').and.have.length(0);
                      done();
                    });
                });

            });
        });
    });
  });

  describe.only('Register a WebHook to event-stream:', function(){
    var streamId;

    afterEach(function(done){
      var promises = [];
      promises.push(
        new Promise(function (resolve, reject) {
          //remove created webhook
          request
            .del(url + '/events/stream/hooked_stream_' + streamId)
            .set('X-Auth-Token', token)
            .set('x-subkit-event-webhook', 'https://localhost:8080/stores/hooked_stream_store_' + streamId)
            .accept('json')
            .end(function (err, res) {
              if (err) {
                reject(err);
              }
              res.status.should.be.equal(202);
              res.body.should.have.property('message').and.be.equal('delete accepted');
              resolve();
            });
        })
      );
      promises.push(
        new Promise(function (resolve, reject) {
          //delete created store
          request
            .del(url + '/stores/hooked_stream_' + streamId)
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function (err, res) {
              if (err) {
                reject(err);
              }
              res.status.should.be.equal(202);
              res.body.should.have.property('message').and.be.equal('delete accepted');
              resolve();
            });
        })
      );

      Promise.all(promises)
        .then(function (res) {
          done();
        })
        .catch(function (err) {
          done();
        });
    });

    it('It creates a hook to a stream', function(done) {
      streamId = uuid.v4();
      request
        .post(url + '/events/stream/hooked_stream_' + streamId)
        .set('X-Auth-Token', token)
        .set('x-subkit-event-webhook', 'http://localhost:8080/stores/hooked_stream_store_' + streamId)
        .set('x-subkit-event-apikey', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('created');
          request
            .get(url + '/events/streams')
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function(res){
              res.status.should.be.equal(200);
              res.body.should.be.an('array');
              expect(_.findWhere(res.body, {stream: 'hooked_stream_' + streamId})).not.to.be.undefined;
              done();
            });
        });
    });

    it('It creates a hook to a stream, emit one event', function(done) {
      streamId = uuid.v4();
      //create a webhook
      request
        .post(url + '/events/stream/hooked_stream_' + streamId)
        .set('X-Auth-Token', token)
        .set('x-subkit-event-webhook', 'http://localhost:8080/stores/hooked_stream_store_' + streamId)
        .set('x-subkit-event-apikey', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('created');
          request
            .post(url + '/events/emit/hooked_stream_' + streamId)
            .set('X-Auth-Token', token)
            .send({
              Title:'New test has been created',
              Body: 'The new test for event emission has been created today :)',
              Moment: '29.04.2015 12:27',
              Number: 1
            })
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              done();
            });
        });
    });

    it('It creates a hook to a stream, emit three events and load event data from store', function(done) {
      streamId = uuid.v4();
      //create a webhook
      request
        .post(url + '/events/stream/hooked_stream_' + streamId)
        .set('X-Auth-Token', token)
        .set('x-subkit-event-webhook', 'https://localhost:8080/stores/hooked_stream_store_' + streamId)
        .set('x-subkit-event-apikey', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('created');
          //emit three events
          request
            .post(url + '/events/emit/' + streamId)
            .set('X-Auth-Token', token)
            .send({
              Title: 'New test has been created',
              Body: 'The new test for event emission has been created today :)',
              Moment: '29.04.2015 12:27',
              Number: 1
            })
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              request
                .post(url + '/events/emit/' + streamId)
                .set('X-Auth-Token', token)
                .send({
                  Title: 'New test has been created',
                  Moment: '29.04.2015 12:27',
                  Number: 2
                })
                .accept('json')
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                  request
                    .post(url + '/events/emit/' + streamId)
                    .set('X-Auth-Token', token)
                    .send({
                      Title: 'newtitle',
                      Body: 'newbody',
                      Number: 3
                    })
                    .accept('json')
                    .end(function (res) {
                      res.status.should.be.equal(201);
                      res.body.should.have.property('message').and.be.equal('emitted');
                      //check store for documents of events
                      request
                        .get(url + '/stores/hooked_stream_store_' + streamId)
                        .set('X-Auth-Token', token)
                        .accept('json')
                        .end(function (res) {
                          res.status.should.be.equal(200);
                          res.body.should.have.property('results').and.be.an('array').and.have.length(3);
                          done();
                        });
                    });
                });
            });
        });
    });

    it('It creates a hook with filter to a stream, emit three events and load event data from store', function(done) {
      streamId = uuid.v4();
      //create a webhook
      request
        .post(url + '/events/stream/hooked_stream_' + streamId)
        .set('X-Auth-Token', token)
        .set('x-subkit-event-webhook', 'http://localhost:8080/stores/hooked_stream_store_' + streamId)
        .set('x-subkit-event-apikey', token)
        .set('x-subkit-event-filter', JSON.stringify({Number: 2}))
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('created');
          //emit three events
          request
            .post(url + '/events/emit/hooked_stream_' + streamId)
            .set('X-Auth-Token', token)
            .send({
              Title: 'New test has been created',
              Body: 'The new test for event emission has been created today :)',
              Moment: '29.04.2015 12:27',
              Number: 1
            })
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(201);
              res.body.should.have.property('message').and.be.equal('emitted');
              request
                .post(url + '/events/emit/hooked_stream_' + streamId)
                .set('X-Auth-Token', token)
                .send({
                  Title: 'second',
                  Moment: '29.04.2015 12:27',
                  Number: 2
                })
                .accept('json')
                .end(function (res) {
                  res.status.should.be.equal(201);
                  res.body.should.have.property('message').and.be.equal('emitted');
                  request
                    .post(url + '/events/emit/hooked_stream_' + streamId)
                    .set('X-Auth-Token', token)
                    .send({
                      Title: 'newtitle',
                      Body: 'newbody',
                      Number: 3
                    })
                    .accept('json')
                    .end(function (res) {
                      res.status.should.be.equal(201);
                      res.body.should.have.property('message').and.be.equal('emitted');
                      //check store for documents of events
                      request
                        .get(url + '/stores/hooked_stream_store_' + streamId)
                        .set('X-Auth-Token', token)
                        .accept('json')
                        .end(function (res) {
                          res.status.should.be.equal(200);
                          res.body.should.have.property('results').and.be.an('array').and.have.length(1);
                          res.body.results.should.have.deep.property('[0].Number').to.be.equal(2);
                          res.body.results.should.have.deep.property('[0].Title').to.be.equal('second');
                          done();
                        });
                    });
                });
            });
        });
    });
  });

  describe('Unregister a WebHook from event-stream:', function(){

    var streamId;

    it('It unregisters a hook from a stream', function(done) {
      streamId = uuid.v4();
      request
        .post(url + '/events/stream/hooked_stream_' + streamId)
        .set('X-Auth-Token', token)
        .set('x-subkit-event-webhook', 'http://localhost:8080/stores/hooked_stream_' + streamId)
        .set('x-subkit-event-apikey', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('created');
          request
            .del(url + '/events/stream/hooked_stream_' + streamId)
            .set('X-Auth-Token', token)
            .set('x-subkit-event-webhook', 'http://localhost:8080/stores/hooked_stream_' + streamId)
            .set('x-subkit-event-apikey', token)
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(202);
              res.body.should.have.property('message').and.be.equal('delete accepted');
              request
                .get(url + '/events/streams')
                .set('X-Auth-Token', token)
                .accept('json')
                .end(function (res) {
                  res.status.should.be.equal(200);
                  res.body.should.be.an('array');
                  expect(_.findWhere(res.body, {stream: 'hooked_stream_' + streamId})).to.be.undefined;
                  done();
                });
            });
        });
    });

    it('It unregisters a non existent hook from a stream', function(done) {
      streamId = uuid.v4();
      request
        .post(url + '/events/stream/hooked_stream_' + streamId)
        .set('X-Auth-Token', token)
        .set('x-subkit-event-webhook', 'http://localhost:8080/stores/hooked_stream_' + streamId)
        .set('x-subkit-event-apikey', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('created');
          request
            .del(url + '/events/stream/hooked_stream_' + streamId)
            .set('X-Auth-Token', token)
            .set('x-subkit-event-webhook', 'http://localhost:8080/stores/not_existed')
            .set('x-subkit-event-apikey', token)
            .accept('json')
            .end(function (res) {
              res.status.should.be.equal(202);
              res.body.should.have.property('message').and.be.equal('delete accepted');
              done();
            });
        });
    });

    it('It should not unregister a hook from a non existent stream', function(done) {
      streamId = undefined;
      request
        .del(url + '/events/stream/not_existed_stream')
        .set('X-Auth-Token', token)
        .set('x-subkit-event-webhook', 'http://localhost:8080/stores/not_existed_stream')
        .set('x-subkit-event-apikey', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(204);
        });
    });
  });

});