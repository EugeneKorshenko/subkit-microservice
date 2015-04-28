'use strict';

var assert  = require('assert');
var restify = require('restify');
var _       = require('underscore');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var request = require('superagent');
chai.use(require('chai-things'));

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

  describe('Subscribe to specific event stream (Transfer-Encoding: chunked)', function(){

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
        .parse( function (res, callback) {
          res.on('data', function (chunk) {
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);
            event[0].should.include.keys(['$name', '$stream', '$persistent', '$key', '$metadata', '$payload'])
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
        .parse( function (res, callback) {
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
            if (event_number == 3) {
              req.abort();
              done()
            };
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
        .parse( function (res, callback) {
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
            if (event_number == 3) {
              req.abort();
              done();
            };
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
        .parse( function (res, callback) {
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
            if (event_number == 3) {
              req.abort();
              done();
            };
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
        .parse( function (res, callback) {
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
            if (event_number == 3) {
              req.abort();
              done();
            };
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

  describe('Subscribe to specific event stream with filter (Transfer-Encoding: chunked)', function(){

    it('Server should not hangs up on wrong filter queries', function(done) {
      var req = request
        .get(url + '/events/stream/another_unique_test_stream')
        .query({where: 'wrong'})
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(400);
          done();
        });
    });

    it('Should receive two of three messages from specified streams with $payload.Number', function(done) {
      var filter = {"payload.Number": {$exists:true}};

      var req = request
        .get(url + '/events/stream/another_unique_test_stream')
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res, callback) {
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

    it('Should receive two of three messages from specified streams without $payload.Number', function(done) {
      var filter = {"payload.Number": {$exists:false}};

      var req = request
        .get(url + '/events/stream/another_unique_test_stream')
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res, callback) {
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

    it('Should receive two of three messages from specified streams with $payload.Number: {"$in": [2]}', function(done) {
      var filter = {"payload.Number": {"$in": [2]}};

      var req = request
        .get(url + '/events/stream/another_unique_test_stream')
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res, callback) {
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
      var filter = {$or: [{"payload.Number": {"$in": [2]}}, {"Msg": {"$in": ['Event #3']}}]};

      var req = request
        .get(url + '/events/stream/another_unique_test_stream')
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res, callback) {
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

  describe('Subscribe to event streams with filter (Transfer-Encoding: chunked)', function() {

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
      var req = request
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
        .parse( function (res, callback) {
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
              done()
            };
          });
        })
        .end();

      request
        .post(url + '/events/emit/A-Stream')
        .set('X-Auth-Token', token)
        .accept('json')
        .send({Msg: 'Event #1', Number: 1})
        .end(function (res) {
          request
            .post(url + '/events/emit/B-Stream')
            .set('X-Auth-Token', token)
            .accept('json')
            .send({Msg: 'Event #1', Number: 1})
            .end(function (res) {
            });
        });
    });

    it('Should receive all messages where matching JSONQuery `{stream: "A-Stream"}` ', function (done) {
      var filter = {stream: 'A-Stream'};

      var req = request
        .get(url + '/events/stream')
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res, callback) {
          var event_number = 0;
          res.on('data', function (chunk) {
            event_number++;
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array').and.have.length(1);

            if(event_number === 1){
              event.should.have.deep.property('[0].$stream').and.be.equal('A-Stream');
              req.abort();
              done()
            }

           });
        })
        .end();

      request
        .post(url + '/events/emit/B-Stream')
        .set('X-Auth-Token', token)
        .accept('json')
        .send({Msg: 'Event #1', Number: 1})
        .end(function (res) {
          request
            .post(url + '/events/emit/A-Stream')
            .set('X-Auth-Token', token)
            .accept('json')
            .send({Msg: 'Event #1', Number: 1})
            .end(function (res) {
            });
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
        .parse( function (res, callback) {
          var event_number = 0;
          res.on('data', function (chunk) {
            event_number++;
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array');
            event.should.not.include.something.that.deep.equals({stream: 'B-Stream'});
            if (event_number == 2) {
              req.abort();
              done()
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
      var filter = {$and: [{stream: 'A-Stream'}, {"payload.Number": 2}]};

      var req = request
        .get(url + '/events/stream')
        .query({size: 2})
        .query({where: JSON.stringify(filter)})
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res, callback) {
          var event_number = 0;
          res.on('data', function (chunk) {
            event_number++;
            var event = JSON.parse(chunk.toString());
            event.should.be.an('array');
            event.should.not.include.something.that.deep.equals({stream: 'B-Stream'});
            event.should.have.deep.property('[0].$payload').to.be.an('object').and.have.property('Number').to.be.equal(2);
            if (event_number == 2) {
              req.abort();
              done()
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
  });

  describe('Emit an event', function(){});

  describe('Emit a persistent event', function(){});

  describe('Read event history (stream-log)', function(){});

  describe('Delete event history (stream-log)', function(){});

  describe('Register a WebHook to event-stream', function(){});

  describe('Unregister a WebHook from event-stream', function(){});

  describe('on stream', function(){

    var jsonClient = restify.createJsonClient({
      rejectUnauthorized: false,
      url: url,
      headers: { 'x-auth-token': token }
    });

    it('a emit should receive a event', function(done){

      var rawClient = restify.createClient({
        rejectUnauthorized: false,
        url: url,
        headers: {'x-auth-token': token}
      });

      rawClient.get('/events/stream/mystream', function(err, req){

        req.on('result', function(err, res) {
          assert.ifError(err);

          res.on('data', function(chunk) {
            var obj = JSON.parse(chunk.toString());
            assert.equal(obj.length, 1);
            assert.equal(obj[0].$payload.Msg, 'Hello Subkit!');
            done();
          });

        });

      });

      jsonClient.post('/events/emit/mystream', {Msg:'Hello Subkit!', Number: 1});

    });

  });

  describe('on webhook', function(){
    it('should create and call a bound webhook', function(done){
      var client = restify.createJsonClient({
        rejectUnauthorized: false,
        url: url,
        headers: {
          'x-auth-token': token,
          'x-subkit-event-webhook': 'https://127.0.0.1:8080/stores/events',
          'x-subkit-event-apikey': token
        }
      });
      client.post('/events/stream/eventstream1', {}, function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(actual.message, 'created');

        client.get('/events/streams', function(error, req, res, actual){
          assert.ifError(error);

          var inspect = _.findWhere(actual, {stream: 'eventstream1'});
          assert.notEqual(inspect, null);
          assert.equal(inspect.id, 'https://127.0.0.1:8080/stores/events');

          client.post('/events/emit/eventstream1', {content:'a'}, function(error, req, res, actual){
            assert.ifError(error);
            assert.equal(actual.message, 'emitted');

            client.del('/events/stream/eventstream1', function(error, req, res, actual){
              assert.ifError(error);
              assert.equal(actual.message, 'delete accepted');

              client.get('/events/streams', function(error, req, res, actual){
                assert.ifError(error);
                assert.equal(_.findWhere(actual, {stream: 'eventstream1'}), null);
                done();
              });
            });
          });

        });

      });
    });

    it('should call bound webhook when filter match', function(done){
      var client = restify.createJsonClient({
        rejectUnauthorized: false,
        url: url,
        headers: {
          'x-auth-token': token,
          'x-subkit-event-webhook': 'https://127.0.0.1:8080/stores/events1',
          'x-subkit-event-apikey': token,
          'x-subkit-event-filter': JSON.stringify({content:'b'})
        }
      });
      client.post('/events/stream/eventstream1', {}, function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(actual.message, 'created');

        client.post('/events/emit/eventstream1', {content:'b'}, function(error, req, res, actual){
          assert.ifError(error);
          assert.equal(actual.message, 'emitted');

          client.del('/events/stream/eventstream1', function(error, req, res, actual){
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
        url: url,
        headers: {
          'x-auth-token': token,
          'x-subkit-event-webhook': 'https://127.0.0.1:8080/stores/events2',
          'x-subkit-event-apikey': token,
          'x-subkit-event-filter': JSON.stringify({content:'c'})
        }
      });
      client.post('/events/stream/eventstream1', {}, function(error, req, res, actual){
        assert.ifError(error);
        assert.equal(actual.message, 'created');

        client.post('/events/emit/eventstream1', {content:'notmatch'}, function(error, req, res, actual){
          assert.ifError(error);
          assert.equal(actual.message, 'emitted');

          client.del('/events/stream/eventstream1', function(error, req, res, actual){
            assert.ifError(error);
            assert.equal(actual.message, 'delete accepted');
            done();
          });

        });
      });
    });

  });

});