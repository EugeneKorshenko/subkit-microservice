'use strict';

var request = require('superagent');
var chai = require('chai');
var expect = chai.expect;
var jf = require('jsonfile');

var url = 'https://localhost:8080';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var credentials = jf.readFileSync('./test/integration/fixtures/credentials.json');
var token = credentials.api.apiKey;

describe('Integration: Manage.', function(){
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

  describe('Login:', function(){
    it('login with correct credentials should succeed', function(done){
    request
      .post(url + '/manage/login')
      .send(credentials.login)
      .set('X-Auth-Token', token)
      .accept('json')
      .end(function(res){
        res.status.should.be.equal(200);
        res.body.should.have.property('api').that.be.an('object').that.has.property('apiKey').that.be.equal(token);
        res.body.should.have.property('app').that.be.an('object').that.include.keys(['id', 'domain', 'port', 'key', 'cert', 'ca']);
        done();
      });
    });
  });

  describe('Reset API-Key:', function(){
    it('It should reset API-Key and return new one', function(done){
      request
        .put(url + '/manage/apikey/reset')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('apiKey').that.be.an('string');

          //save new token for future use
          //credentials.api.apiKey = res.body.apiKey;
          //jf.writeFile('./test/integration/fixtures/credentials.json', credentials);

          res.body.should.have.property('message').that.be.equal('update accepted');
          done();
        });
    });
  });

  describe('Change administration username:', function(){

    afterEach(function(done){
      request
        .put(url + '/manage/user')
        .set('X-Auth-Token', token)
        .send({ "username": credentials.admin.username })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').that.be.equal('update accepted');
          done();
        });
    });

    it('It should set administrator`s user name', function(done){
      request
        .put(url + '/manage/user')
        .set('X-Auth-Token', token)
        .send({ "username": "sss" })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').that.be.equal('update accepted');
          done();
        });
    });

    it('It shouldn`t set administrator`s user name if token is missing', function(done){
      request
        .put(url + '/manage/user')
        .send({ "username": "sss" })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('It shouldn`t set administrator`s user name if token is wrong', function(done){
      request
        .put(url + '/manage/user')
        .set('X-Auth-Token', 'wrong_token')
        .send({ "username": "sss" })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

  });

  describe('Reset administration password:', function(){});

  describe('Get SSL certificates:', function(){});

  describe('Change SSL certificates:', function(){});

  describe('Process and OS informations:', function(){});

  describe('Kill instance:', function(){});

  describe('Update instance to latest version:', function(){});

  describe('Export documents:', function(){});

  describe('Import documents:', function(){});

  describe('Get Process-Log-File:', function(){});

  describe('Subscribe to Log-Stream:', function(){});

});
