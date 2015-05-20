'use strict';

var request = require('superagent');
var chai = require('chai');
var expect = chai.expect;
var uuid = require('node-uuid');

var url = 'https://localhost:8080';
var token = '66LOHAiB8Zeod1bAeLYW';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Integration Spec: Store commands', function(){
  var server;
  var context;

  before(function(done) {
    server = require('../../server.js');
    context = server.init().getContext();
    setTimeout(done, 500);
  });

  
  after(function(done){
    // clean up the storage in order it to work properly in future tests  
    request
      .del(url + '/stores/Scores')
      .set('X-Auth-Token', token)
      .accept('json')
      .end(function(res){
        res.status.should.be.equal(202);        

        context.storage.close();
        context.server.close();
        delete require.cache[server];
        done();

      });
  });

  describe('#Get all stores', function(){
    it('#GET right path with right token should succeed', function(done){
      request
        .get(url + '/stores')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          res.body.should.have.property('results').and.be.an('array');
          done();
        });
    });
    it('#GET with wrong "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/stores')
        .set('X-Auth-Token', 'wrong_token')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#GET without "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/stores')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
  });

  describe('#Query a store `Scores`', function(){
    it('#GET right path with right token should succeed', function(done){
      request
        .get(url + '/stores/Scores')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          res.body.should.have.property('results').and.be.an('array');
          done();
        });
    });
    it('#GET with wrong "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/stores/Scores')
        .set('X-Auth-Token', 'wrong_token')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#GET without "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/stores/Scores')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
  });

  describe('#Get a document in `Scores`', function(){
    it('#GET should retrieve a document', function(done){
      var key;
      request
        .post(url + '/stores/Scores')
        .send({ foo: 'bar' })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(201);
          res.body.should.have.property('$key').and.exist;
          res.body.should.have.property('$version').and.exist;
          res.body.should.have.property('$timestamp').and.exist;
          res.body.should.have.property('$store').and.exist;
          key = res.body.$key;

          request
            .get(url + '/stores/Scores/'+key)
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function(res) {
              res.status.should.be.equal(200);
              res.body.should.have.property('$key').and.be.equal(key);
              res.body.should.have.property('$name').and.be.equal('Scores');
              res.body.should.have.property('$store').and.be.equal('Scores');
              res.body.should.have.property('$version').and.exist;
              res.body.should.have.property('$timestamp').and.exist;
              res.body.should.have.property('$payload').and.exist;
              done();
            });
        });
    });
    it('#GET with wrong "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/stores/Scores/ec8ffdf0-9b04-11e4-89d3-123b93f75cba')
        .set('X-Auth-Token', 'wrong_token')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#GET without "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/stores/Scores/ec8ffdf0-9b04-11e4-89d3-123b93f75cba')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
  });

  describe('#Create document in Scores-Store (Server-side generated document key)', function(){
    it('#POST with right path with right token should succeed', function(done){
      request
        .post(url + '/stores/Scores')
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('created');
          res.body.should.have.property('$key').and.exist;
          res.body.should.have.property('$version').and.exist;
          res.body.should.have.property('$timestamp').and.exist;
          res.body.should.have.property('$store').and.exist;
          done();
        });
    });
    it('#POST with wrong "X-Auth-Token" header should response 401', function(done){
      request
        .post(url + '/stores/Scores')
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .set('X-Auth-Token', 'wrong_token')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#POST without "X-Auth-Token" header should response 401', function(done){
      request
        .post(url + '/stores/Scores')
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#POST without `Scores` path parameter should response 400', function(done){
      request
        .post(url + '/stores')
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(405);
          done();
        });
    });
    it('#POST with space char in `Scores` path parameter should response 400', function(done){
      request
        .post(url + '/stores/Game Scores')
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(400);
          done();
        });
    });
    it('#POST with special chars should response 400', function(done){
      request
        .post(url + '/stores/Scores*')
        .send({
          'score': '*18*76/*',
          'playerName': '/Karl**',
          'cheatMode': '**/'
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(400);
          done();
        });
    });
  });

  describe('#Create document in Scores-Store (Client-side generated document key)', function(){
    var testDocKey = uuid.v4();
    it('#POST with right path with right token should succeed', function(done){
      request
        .post(url + '/stores/Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('created');
          res.body.should.have.property('$key').and.exist;
          res.body.should.have.property('$version').and.exist;
          res.body.should.have.property('$timestamp').and.exist;
          res.body.should.have.property('$store').and.exist;
          res.body.should.have.property('$key').and.be.equal(testDocKey);
          done();
        });
    });
    it('#POST with wrong "X-Auth-Token" header should response 401', function(done){
      request
        .post(url + '/stores/Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .set('X-Auth-Token', 'wrong_token')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#POST without "X-Auth-Token" header should response 401', function(done){
      request
        .post(url + '/stores/Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#POST without path parameter should response 405 `Method not allowed`', function(done){
      request
        .post(url + '/stores')
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(405);
          done();
        });
    });
    it('#POST with space char in store name should response 400', function(done){
      request
        .post(url + '/stores/Game Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(400);          
          done();
        });
    });
    it('#POST with special chars in store name should response 400', function(done){
      request
        .post(url + '/stores/Game^Scores/' + testDocKey)
        .send({
          'score': '*18*76/*',
          'playerName': '/Karl**',
          'cheatMode': '**/'
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(400);
          done();
        });
    });
    it('#POST with space char in key name should response 400', function(done){
      request
        .post(url + '/stores/Scores/' + testDocKey.replace('-', ' '))
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(400);          
          done();
        });
    });    
    it('#POST with special chars in key name should response 400', function(done){
      request
        .post(url + '/stores/Scores' + testDocKey.replace('-', '^'))
        .send({
          'score': '*18*76/*',
          'playerName': '/Karl**',
          'cheatMode': '**/'
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(400);
          done();
        });
    });
    after(function (done) {
      request
        .del(url + '/stores/Scores/' + testDocKey)
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function () {
          done();
        });
    });
  });

  describe('#Update an existing document in `Scores` store', function(){
    var testDocKey;
    before(function (done) {
      request
        .post(url + '/stores/Scores')
        .send({
          'score': 18786,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function (res) {
          testDocKey = res.body.$key;
          done();
        });
    });
    it('#PUT with right token should succeed', function(done){
      request
        .put(url + '/stores/Scores/' + testDocKey)
        .send({
          'score': 100000,
          'playerName': 'Karl1',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('update accepted');
          res.body.should.have.property('$key').and.exist;
          res.body.should.have.property('$version').and.exist;
          res.body.should.have.property('$timestamp').and.exist;
          res.body.should.have.property('$store').and.exist;
          done();
        });
    });
    it('#PUT with wrong "X-Auth-Token" header should response 401', function(done){
      request
        .put(url + '/stores/Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', 'wrong_token')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#PUT without "X-Auth-Token" header should response 401', function(done){
      request
        .put(url + '/stores/Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#PUT without `Scores` path parameter should response 405', function(done){
      request
        .put(url + '/stores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(405);
          done();
        });
    });
    it('#PUT with space char in `Scores` path parameter should response 405', function(done){
      request
        .put(url + '/stores/Game Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(405);
          done();
        });
    });
    it('#PUT with another non-existing document key should response 404 Not found', function(done){
      request
        .put(url + '/stores/Scores/XXX')
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(404);
          done();
        });
    });
    after(function (done) {
      request
        .del(url + '/stores/Scores/' + testDocKey)
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function () {
          done();
        });
    });
  });

  describe('#Conditional update of an existing document in `Scores` store', function(){
    var ifMatch = 0;
    var testDocKey;
    beforeEach(function(done){
      request
        .post(url + '/stores/Scores')
        .send({
          'score': 18786,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function (res) {
          testDocKey = res.body.$key;
          request
            .get(url + '/stores/Scores/' + testDocKey)
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function(res){
              res.body.should.have.property('$version');
              ifMatch = res.body.$version;
              done();
            });
        });
    });
    it('#PUT with right token should succeed', function(done){
      request
        .put(url + '/stores/Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .set('If-Match', ifMatch)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('update accepted');
          res.body.should.have.property('$key').and.exist;
          res.body.should.have.property('$version').and.exist;
          res.body.should.have.property('$timestamp').and.exist;
          res.body.should.have.property('$store').and.exist;          
          done();
        });
    });
    it('#PUT with wrong "X-Auth-Token" header should response 401', function(done){
      request
        .put(url + '/stores/Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', 'wrong_token')
        .set('If-Match', ifMatch)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#PUT without "X-Auth-Token" header should response 401', function(done){
      request
        .put(url + '/stores/Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('If-Match', ifMatch)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#PUT without `Scores` path parameter should response 405', function(done){
      request
        .put(url + '/stores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .set('If-Match', ifMatch)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(405);
          done();
        });
    });
    it('#PUT with space char in `Scores` path parameter should response 405', function(done){
      request
        .put(url + '/stores/Game Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .set('If-Match', ifMatch)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(405);
          done();
        });
    });
    it('#PUT with another non-existing document key should response 404 Not found', function(done){
      request
        .put(url + '/stores/Scores/1c9f4c3e-86bb-11e4-b116-123bg3f5dXXX')
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .set('If-Match', ifMatch)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(404);
          done();
        });
    });
    it('#PUT with "If-Match" < document.$version, the document version should response 412-Version conflict', function(done){
      request
        .put(url + '/stores/Scores/' + testDocKey)
        .send({
          'score': 12276,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .set('If-Match', ifMatch-1)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(412);
          res.body.should.have.property('message').and.be.equal('Version conflict');
          done();
        });
    });
    it('#PUT with "If-Match" = document.$version, the document version should be updated and the response body should contain the updated values', function(done){
      request
        .put(url + '/stores/Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .set('If-Match', ifMatch)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('update accepted');
          res.body.should.have.property('$key').and.exist;
          res.body.should.have.property('$version').and.exist;
          res.body.should.have.property('$timestamp').and.exist;
          res.body.should.have.property('$store').and.exist;          
          done();
        });
    });
    it('#PUT with "If-Match" > document.$version, the document version should be updated and the response body should contain the updated values', function(done){
      request
        .put(url + '/stores/Scores/' + testDocKey)
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': true
        })
        .set('X-Auth-Token', token)
        .set('If-Match', ifMatch+1)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('update accepted');
          res.body.should.have.property('$key').and.exist;
          res.body.should.have.property('$version').and.exist;
          res.body.should.have.property('$timestamp').and.exist;
          res.body.should.have.property('$store').and.exist;          
          done();
        });
    });
  });

  describe('#Delete documents', function(){
    var testDocKey;

    beforeEach(function(done){
      request
        .post(url + '/stores/Scores')
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(201);
          testDocKey = res.body.$key;
          done();
        });
    });
    it('#DELETE should repsponse 202 and { "message":"delete accepted" }', function(done){
      request
        .del(url + '/stores/Scores/' + testDocKey)
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('delete accepted');
          done();
        });
    });
    it('#DELETE with another -not existing- document key should response 202 and { "message":"delete accepted" }', function(done){
      request
        .del(url + '/stores/Scores/sw')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('delete accepted');
          done();
        });
    });
    it('#DELETE without "X-Auth-Token" header should response 401', function(done){
      request
        .del(url + '/stores/Scores/' + testDocKey)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#DELETE with wrong "X-Auth-Token" header should response 401', function(done){
      request
        .del(url + '/stores/Scores/' + testDocKey)
        .set('X-Auth-Token', 'wrong token')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#DELETE with -not existing- resource should response 202 (idempotent operation)', function(done){
      request
        .del(url + '/stores/' + testDocKey)
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          done();
        });
    });
    it('#DELETE with mal formatted resource path should response 405', function(done){
      request
        .del(url + '/stores/%$Scorüäöes/' + testDocKey)
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(405);
          done();
        });
    });
  });

  describe('#Conditional delete documents', function(){
    var ifMatch = 0;
    var testDocKey;
    beforeEach(function(done){
      request
        .post(url + '/stores/Scores')
        .send({
          'score': 1876,
          'playerName': 'Karl',
          'cheatMode': false
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(201);
          res.body.should.have.property('$key').and.exist;
          res.body.should.have.property('$version').and.exist;
          res.body.should.have.property('$timestamp').and.exist;
          res.body.should.have.property('$store').and.exist;          
          testDocKey = res.body.$key;
          
          setTimeout(function(){

            request
              .get(url + '/stores/Scores/' + testDocKey)
              .set('X-Auth-Token', token)
              .accept('json')        
              .end(function(res){
                res.status.should.be.equal(200);
                res.body.should.have.property('$version');
                ifMatch = res.body.$version;
                done();
              });

          }, 20); // write/read latency
          
        });
    });
    it('#DELETE with another -not existing- document key should response 404', function(done){
      request
        .del(url + '/stores/Scores/b6ce69ae-9cd0-11e4-89d3-123b93f75cba')
        .set('X-Auth-Token', token)
        .set('If-Match', ifMatch)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(404);
          done();
        });
    });
    it('#DELETE with wrong "X-Auth-Token" header should response 401', function(done){
      request
        .del(url + '/stores/Scores/' + testDocKey)
        .set('X-Auth-Token', 'wrong_token')
        .set('If-Match', ifMatch)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#DELETE without "X-Auth-Token" header should response 401', function(done){
      request
        .del(url + '/stores/Scores/' + testDocKey)
        .set('If-Match', ifMatch)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#DELETE with mal formatted resource path should response 405', function(done){
      request
        .del(url + '/stores/öGa"meäüaöldsSc/' + testDocKey)
        .set('X-Auth-Token', token)
        .set('If-Match', ifMatch)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(405);
          done();
        });
    });
    it('#DELETE  with "If-Match" < document.$version, the document version should response 412-Version conflict', function(done){
      request
        .del(url + '/stores/Scores/' + testDocKey)
        .set('X-Auth-Token', token)
        .set('If-Match', ifMatch-1)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(412);
          res.body.should.have.property('message').and.be.equal('Version conflict');          
          done();
        });
    });
    it('#DELETE the document with with "If-Match" = document.$version, the document version should be updated and the response body should contain the updated values', function(done){
      request
        .del(url + '/stores/Scores/' + testDocKey)
        .set('X-Auth-Token', token)
        .set('If-Match', ifMatch)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('delete accepted');
          done();
        });
    });
    it('#DELETE the document with with "If-Match" > document.$version, the document version should be updated and the response body should contain the updated values', function(done){
      request
        .del(url + '/stores/Scores/' + testDocKey)
        .set('X-Auth-Token', token)
        .set('If-Match', ifMatch+1)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('delete accepted');          
          done();
        });
    });
  });

  describe('#Complex test for create + get + update + get + delete + get', function(){
    var testDocKey = uuid.v4();
    var doc = {
      score: 24652,
      playerName: 'Karl',
      cheatMode: false,
      foo: 'bar;'
    };
    var newDoc = {
      score: 100000,
      playerName: 'Karl1',
      cheatMode: true
    };
    it('#Create document', function(done){
      request
        .post(url + '/stores/Scores/' + testDocKey)
        .send(doc)
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(201);
          res.body.should.have.property('message').and.be.equal('created');
          res.body.should.have.property('$key').and.exist;
          res.body.should.have.property('$version').and.exist;
          res.body.should.have.property('$timestamp').and.exist;
          res.body.should.have.property('$store').and.exist;
          res.body.should.have.property('$key').and.be.equal(testDocKey);
          done();
        });
    });
    it('#Get previously created document', function(done) {
      request
        .get(url + '/stores/Scores/' + testDocKey)
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(200);
          res.body.should.have.property('$key').and.be.equal(testDocKey);
          res.body.should.have.property('$name').and.be.equal('Scores');
          res.body.should.have.property('$store').and.be.equal('Scores');
          res.body.should.have.property('$version').and.exist;
          res.body.should.have.property('$timestamp').and.exist;
          res.body.should.have.property('$payload').and.exist;
          for (var key in doc) {
            res.body.should.have.property('$payload').and.have.property(key).and.be.equal(doc[key]);
          }
          done();
        });
    });
    it('#Update previously created document', function(done){
      request
        .put(url + '/stores/Scores/' + testDocKey)
        .send(newDoc)
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('update accepted');
          res.body.should.have.property('$key').and.exist;
          res.body.should.have.property('$version').and.exist;
          res.body.should.have.property('$timestamp').and.exist;
          res.body.should.have.property('$store').and.exist;
          done();
        });
    });
    it('#Get previously updated document', function(done) {
      request
        .get(url + '/stores/Scores/' + testDocKey)
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(200);
          res.body.should.have.property('$key').and.be.equal(testDocKey);
          res.body.should.have.property('$name').and.be.equal('Scores');
          res.body.should.have.property('$store').and.be.equal('Scores');
          res.body.should.have.property('$version').and.exist;
          res.body.should.have.property('$timestamp').and.exist;
          res.body.should.have.property('$payload').and.exist;
          for (var key in newDoc) {
            res.body.should.have.property('$payload').and.have.property(key).and.be.equal(newDoc[key]);
          }
          expect(Object.keys(res.body.$payload)).have.length(Object.keys(newDoc).length);
          done();
        });
    });
    it('#Delete previously updated document', function(done) {
      request
        .del(url + '/stores/Scores/' + testDocKey)
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(202);
          res.body.should.have.property('message').and.be.equal('delete accepted');
          done();
        });
    });
    it('#Get previously deleted document', function(done) {
      request
        .get(url + '/stores/Scores/' + testDocKey)
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function (res) {
          res.status.should.be.equal(400);
          done();
        });
    });
  });

});
