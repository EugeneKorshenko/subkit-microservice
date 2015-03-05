'use strict';

var request = require('superagent');
var should = require('chai');
should = should.should();

var url = 'https://localhost:8080';
var token = '66LOHAiB8Zeod1bAeLYW';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var docs = require('./fixtures/documents.js').testDocuments;
var limit2 = 2;

var addDocs = function(doc) {
    request
      .post(url + '/stores/Scores')
      .send(doc)
      .set('X-Auth-Token', token)
      .accept('json')
      .end(function(res){
        return res.body.key;
      });
};

describe('Integration Spec: Store  queries', function(){
  var server;
  var context;

  before(function(done) {
    server = require('../server.js');
    context = server.init().getContext();
    setTimeout(done, 500);
  });

  after(function(done){
    context.storage.close();
    context.server.close();
    delete require.cache[server];
    done();
  });

  describe('Limit document results', function(){
    var DocumentsInStore = 4;
    before(function(done){
      for (var i = 0; i < DocumentsInStore; i++)
        addDocs(docs[i]);
      setTimeout(function() {
        done();
      }, 200);
    });

    it('#GET should response 200 with expected results', function(done){
      request
        .get(url + '/stores/Scores')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          res.body.should.have.property('results').and.be.an('array').and.have.length(DocumentsInStore);
          res.body.results.should.have.deep.property('[0].$name');
          res.body.results.should.have.deep.property('[0].$store');
          res.body.results.should.have.deep.property('[0].$key');
          res.body.results.should.have.deep.property('[0].$version');
          res.body.results.should.have.deep.property('[0].$timestamp');
          res.body.results.should.have.deep.property('[0].$payload');
          done();
        });
    });
    it('#GET with `limit=0` should response 200 with expected results (DocumentsInStore documents)', function(done){
      request
        .get(url + '/stores/Scores?limit=0')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          res.body.should.have.property('results').and.be.an('array').and.have.length(DocumentsInStore);
          res.body.results.should.have.deep.property('[0].$name');
          res.body.results.should.have.deep.property('[0].$store');
          res.body.results.should.have.deep.property('[0].$key');
          res.body.results.should.have.deep.property('[0].$version');
          res.body.results.should.have.deep.property('[0].$timestamp');
          res.body.results.should.have.deep.property('[0].$payload');
          done();
        });
    });
    it('#GET with `limit=2` should response 200 with expected results (2 documents)', function(done){
      request
        .get(url + '/stores/Scores?limit=2')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          res.body.should.have.property('results').and.be.an('array').and.have.length(limit2);
          res.body.results.should.have.deep.property('[0].$name');
          res.body.results.should.have.deep.property('[0].$store');
          res.body.results.should.have.deep.property('[0].$key');
          res.body.results.should.have.deep.property('[0].$version');
          res.body.results.should.have.deep.property('[0].$timestamp');
          res.body.results.should.have.deep.property('[0].$payload');
          done();
        });
    });
    it('#GET with special chars (except _,-,@,!) in store should response 405', function(done){
      request
        .get(url + '/sto*r^es/Scores')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(405);
          done();
        });
    });
    it('#GET with special chars (except _,-,@,!) in key should response 400', function(done){
      request
        .get(url + '/stores/Sco^r&es')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(400);
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
    after(function(done) {
      request
        .del(url + '/stores/Scores')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(){
          done();
        });
    });
  });

  describe('Documents pagination', function(){
    var DocumentsInStore = 4;
    before(function(done){
      for (var i = 0; i < DocumentsInStore; i++)
        addDocs(docs[i]);
        setTimeout(function() {
          done();
        }, 200);
    });
    it('#GET with `page=0` should response 200 with expected results (4-documents)', function(done){
      request
        .get(url + '/stores/Scores?page=0')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          res.body.should.have.property('results').and.be.an('array').and.have.length(4);
          done();
        });
    });
    it('#GET with `page=-1` should response 200 with expected results (0-documents)', function(done){
      request
        .get(url + '/stores/Scores?page=-1')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          res.body.should.have.property('results').and.be.an('array').and.have.length(0);
          done();
        });
    });
    it('#GET with `page=0, limit=2` should response 200 with expected results (2 documents)', function(done){
      request
        .get(url + '/stores/Scores?limit=2&page=0')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          res.body.should.have.property('results').and.be.an('array').and.have.length(2);
          done();
        });
    });
    it('#GET with `page=1, limit=2` should response 200 with expected results (2 documents)', function(done){
      request
        .get(url + '/stores/Scores?limit=2&page=1')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          res.body.should.have.property('results').and.be.an('array').and.have.length(2);
          done();
        });
    });
    it('#GET with `page=2, limit=2` should response 200 with expected results (0 documents)', function(done){
      request
        .get(url + '/stores/Scores?limit=2&page=2')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          res.body.should.have.property('results').and.be.an('array').and.have.length(0);
          done();
        });
    });
    it('#GET with special chars (except _,-,@,!) in store should response 405', function(done){
      request
        .get(url + '/sto*r^es/Scores?limit=2&page=1')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(405);
          done();
        });
    });
    it('#GET with special chars (except _,-,@,!) in key should response 400', function(done){
      request
        .get(url + '/stores/Sco^r&es?limit=2&page=1')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(400);
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
    after(function(done) {
      request
        .del(url + '/stores/Scores')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(){
          done();
        });
    });
  });

  describe('#Documents without payload', function(){
    var DocumentsInStore = 2;
    before(function(done){
      for (var i = 0; i < DocumentsInStore; i++)
        addDocs(docs[i]);
      setTimeout(function() {
        done();
      }, 200);
    });
    it('#GET should response 200 with expected results', function(done){
      request
        .get(url + '/stores/Scores?keysOnly=true')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          res.body.should.have.property('results').and.be.an('array').and.have.length(DocumentsInStore);
          res.body.results.should.have.deep.property('[0].$name');
          res.body.results.should.have.deep.property('[0].$store');
          res.body.results.should.have.deep.property('[0].$key');
          res.body.results.should.have.deep.property('[0].$version');
          res.body.results.should.have.deep.property('[0].$timestamp');
          res.body.results.should.not.have.deep.property('[0].$payload');
          done();
        });
    });
    it('#GET with special chars (except _,-,@,!) in store should response 405', function(done){
      request
        .get(url + '/sto*r^es/Scores?keysOnly=true')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(405);
          done();
        });
    });
    it('#GET with special chars (except _,-,@,!) in key should response 400', function(done){
      request
        .get(url + '/stores/Sco^r&es?keysOnly=true')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(400);
          done();
        });
    });
    it('#GET with wrong "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/stores/Scores?keysOnly=true')
        .set('X-Auth-Token', 'wrong_token')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    it('#GET without "X-Auth-Token" header should response 401', function(done){
      request
        .get(url + '/stores/Scores?keysOnly=true')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
    after(function(done) {
      request
        .del(url + '/stores/Scores')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(){
          done();
        });
    });
  });

  describe('#Filter documents with JSON-Query', function() {
    before(function (done) {
      for (var i = 0; i < docs.length; i++)
        addDocs(docs[i]);
      setTimeout(function () {
        done();
      }, 200);
    });
    describe('#Query - Where ', function() {
      it('#GET where={"score":{"$gte":1000,"$lte":3000}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"score":{"$gte":1000,"$lte":3000}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(7); //There are 7 documents with 1000 >= Score <= 3000 in fixture.
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('score').and.be.within(1000, 3000);
            }
            done();
          });
      });
      it('#GET where={"score":{"$ne":1230}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"score":{"$ne":1230}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(9);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('score').and.not.be.equal(1230);
            }
            done();
          });
      });
      it('#GET where={"score":{"$gt":1000,"$lt":3000}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"score":{"$gt":1000,"$lt":3000}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(6);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('score').and.be.gt(1000).and.be.lt(3000);
            }
            done();
          });
      });
      it('#GET where={"playerName":{"$in":["Karl","Berta"]}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"playerName":{"$in":["Karl","Berta"]}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(5);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('playerName');
              var arr = [];
              arr.push(res.body.results[i].$payload.playerName);
              ['Karl', 'Berta'].should.include.members(arr);
            }
            done();
          });
      });
      it('#GET where={"playerName":{"$nin":["Karl","Berta"]}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"playerName":{"$nin":["Karl","Berta"]}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(6);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('playerName');
              var arr = [];
              arr.push(res.body.results[i].$payload.playerName);
              ['Karl', 'Berta'].should.not.include.members(arr);
            }
            done();
          });
      });
      it('#GET where={"foo":"baric"} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"foo":"baric"}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(1);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('playerName');
              res.body.results[i].$payload.should.have.property('foo').and.be.equal('baric');
            }
            done();
          });
      });
      it('#GET where={"foo":{"$exists":true}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"foo":{"$exists":true}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(2);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('foo');
            }
            done();
          });
      });
      it('#GET where={blablabla} should response 200', function (done) {
        request
          .get(url + '/stores/Scores?where={blablabla}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(11);
            done();
          });
      });
      it('#GET where={"blablabla"} should response 200', function (done) {
        request
          .get(url + '/stores/Scores?where={"blablabla"}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(11);
            done();
          });
      });
      it('#GET where={"foo":"baricpp"} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"foo":"baricpp"}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(0);
            done();
          });
      });
      it('#GET where={"typedField":{"$type":1}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"typedField":{"$type":1}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(1);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('typedField').and.be.a('number');
            }
            done();
          });
      });
      it('#GET where={"typedField":{"$type":2}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"typedField":{"$type":2}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(2);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('typedField').and.be.a('string');
            }
            done();
          });
      });
      it('#GET where={"typedField":{"$type":3}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"typedField":{"$type":3}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(3);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('typedField').and.be.a('object');
            }
            done();
          });
      });
      it('#GET where={"typedField":{"$type":4}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"typedField":{"$type":4}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(4);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('typedField').and.be.a('array');
            }
            done();
          });
      });
      it('#GET where={"typedField1":{"$type":8}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"typedField1":{"$type":8}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(7);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('typedField1').and.be.a('boolean');
            }
            done();
          });
      });
      it('#GET where={"labels":{"$all":[1,2]}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"labels":{"$all":[1,2]}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(3);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('labels').and.include.members([1, 2]);
            }
            done();
          });
      });
      it('#GET where={"$or":[{"labels":{"$all":[1,2]}},{"playerName":"Maria"}]} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"$or":[{"labels":{"$all":[1,2]}},{"playerName":"Maria"}]}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(4);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
            }
            done();
          });
      });
      it.skip('#GET where={{"labels":{"$all":[1,2]}},{"playerName":"Martin"}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={{"labels":{"$all":[1,2]}},{"playerName":"Martin"}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(2);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('labels').and.include.members([1, 2]);
              res.body.results[i].$payload.should.have.property('playerName').and.be.equal('Martin');
            }
            done();
          });
      });
      it('#GET where={"labels":{"$all":[1,2]},"playerName":"Martin"} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"labels":{"$all":[1,2]},"playerName":"Martin"}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(2);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('labels').and.include.members([1, 2]);
              res.body.results[i].$payload.should.have.property('playerName').and.be.equal('Martin');
            }
            done();
          });
      });
      it('#GET where={{"playerName":"Karl"},{"foo": {"$exists": true}}} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"playerName":"Karl","foo":{"$exists": true}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(1);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.have.property('foo');
              res.body.results[i].$payload.should.have.property('playerName').and.be.equal('Karl');
            }
            done();
          });
      });
      it('#GET where={"$or":[{"playerName":"Karl"},{"foo": {"$exists": true}}]} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"$or":[{"playerName":"Karl"},{"foo":{"$exists": true}}]}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(5);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.satisfy(function(payload) {
                return payload.hasOwnProperty('foo') || payload.hasOwnProperty('playerName') && payload.playerName === 'Karl';
              });
            }
            done();
          });
      });
      it('#GET where={"$or":[{"playerName":"Karl"},{"foo": {"$exists": true}}],"score":500} should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?where={"$or":[{"playerName":"Karl"},{"foo":{"$exists": true}}],"score":500}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.have.property('results').and.be.an('array').and.have.length(1);
            for (var i = 0; i < res.body.results.length; i++) {
              res.body.results[i].should.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
              res.body.results[i].$payload.should.satisfy(function(payload) {
                return payload.hasOwnProperty('foo') || payload.hasOwnProperty('playerName') && payload.playerName === 'Karl';
              });
              res.body.results[i].$payload.should.have.property('score').and.be.equal(500);
            }
            done();
          });
      });
      it('#GET with special chars (except _,-,@,!) in store should response 405', function (done) {
        request
          .get(url + '/sto*r^es/Scores?where={"score":{"$gte":1000,"$lte":3000}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(405);
            done();
          });
      });
      it('#GET with special chars (except _,-,@,!) in key should response 400', function (done) {
        request
          .get(url + '/stores/Sco^r&es?where={"score":{"$gte":1000,"$lte":3000}}')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(400);
            done();
          });
      });
      it('#GET with wrong "X-Auth-Token" header should response 401', function (done) {
        request
          .get(url + '/stores/Scores?where={"score":{"$gte":1000,"$lte":3000}}')
          .set('X-Auth-Token', 'wrong_token')
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(401);
            done();
          });
      });
      it('#GET without "X-Auth-Token" header should response 401', function (done) {
        request
          .get(url + '/stores/Scores?where={"score":{"$gte":1000,"$lte":3000}}')
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(401);
            done();
          });
      });
    });
    describe('#Query - GroupBy ', function() {
      it('#GET groupby="playerName" (field "playerName" exists in all docs) should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?groupby=playerName')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.be.an('object');
            for (var key in res.body) {
              if (res.body.hasOwnProperty(key)) {
                res.body[key].should.be.an('array');
                for (var i = 0; i < res.body[key].length; i++) {
                  res.body[key][i].should.be.an('object').and.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
                  res.body[key][i].$payload.should.have.property('playerName').and.be.equal(key);
                }
              }
            }
            done();
          });
      });
      it.skip('#GET groupby="test field name" (field "test field name" does not exists in all docs and includes spaces) should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?groupby="test field name"')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.be.an('object');
            var field_was_found = false;
            for (var key in res.body) {
              if (res.body.hasOwnProperty(key)) {
                res.body[key].should.be.an('array');
                for (var i = 0; i < res.body[key].length; i++) {
                  res.body[key][i].should.be.an('object').and.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
                  if (key === 'undefined') {
                    res.body[key][i].$payload.should.not.have.property('test field name');
                  } else {
                    field_was_found = true;
                    res.body[key][i].$payload.should.have.property('test field name').and.be.equal(key);
                  }
                }
              }
            }
            field_was_found.should.be.equal(true);
            done();
          });
      });
      it.skip('#GET groupby="labels" (field "labels" is array) should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?groupby=labels')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.be.an('object');
            console.log(res.body);
            for (var key in res.body) {
              if (res.body.hasOwnProperty(key)) {
                res.body[key].should.be.an('array');
                for (var i = 0; i < res.body[key].length; i++) {
                  res.body[key][i].should.be.an('object').and.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
                  res.body[key][i].$payload.should.have.property('labels').and.include.members([key]);
                }
              }
            }
            done();
          });
      });
      it('#GET groupby="foo" (field "foo" does not exists in all docs) should response 200 with expected results', function (done) {
        request
          .get(url + '/stores/Scores?groupby=foo')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(200);
            res.body.should.be.an('object');
            var field_was_found = false;
            for (var key in res.body) {
              if (res.body.hasOwnProperty(key)) {
                res.body[key].should.be.an('array');
                for (var i = 0; i < res.body[key].length; i++) {
                  res.body[key][i].should.be.an('object').and.include.keys('$name', '$store', '$key', '$version', '$timestamp', '$payload');
                  if (key === 'undefined') {
                    res.body[key][i].$payload.should.not.have.property('foo');
                  } else {
                    field_was_found = true;
                    res.body[key][i].$payload.should.have.property('foo').and.be.equal(key);
                  }
                }
              }
            }
            field_was_found.should.be.equal(true);
            done();
          });
      });
      it('#GET with special chars (except _,-,@,!) in store should response 405', function (done) {
        request
          .get(url + '/sto*r^es/Scores?groupby=playerName')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(405);
            done();
          });
      });
      it('#GET with special chars (except _,-,@,!) in key should response 400', function (done) {
        request
          .get(url + '/stores/Sco^r&es?groupby=playerName')
          .set('X-Auth-Token', token)
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(400);
            done();
          });
      });
      it('#GET with wrong "X-Auth-Token" header should response 401', function (done) {
        request
          .get(url + '/stores/Scores?groupby=playerName')
          .set('X-Auth-Token', 'wrong_token')
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(401);
            done();
          });
      });
      it('#GET without "X-Auth-Token" header should response 401', function (done) {
        request
          .get(url + '/stores/Scores?groupby=playerName')
          .accept('json')
          .end(function (res) {
            res.status.should.be.equal(401);
            done();
          });
      });
    });
    after(function (done) {
      request
        .del(url + '/stores/Scores')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function () {
          done();
        });
    });
  });

});
