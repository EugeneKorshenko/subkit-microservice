'use strict';

var request = require('superagent');
var chai = require('chai');
var expect = chai.expect;

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-array'));

var url = 'https://localhost:8080';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var token = '66LOHAiB8Zeod1bAeLYW';

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
      .auth('subkit', 'subkit')
      .accept('json')
      .end(function(res){
        res.status.should.be.equal(200);
        res.body.should.include.keys(['id', 'domain', 'port', 'apiKey']);
        res.body.should.has.property('apiKey').that.be.equal(token);
        done();
      });
    });

    it('should not login with wrong credentials should succeed', function(done){
      request
        .post(url + '/manage/login')
        .auth('wrong', 'credentials')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

  });

  describe('Reset API-Key:', function(){

    afterEach(function(done){
      request
        .put(url + '/manage/apikey/reset')
        .set('X-Auth-Token', 'NEW_ABC_API-KEY')
        .accept('json')
        .send({ apiKey:  token})
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').that.be.equal('update accepted');
          res.body.should.have.property('apiKey').that.be.an('string');
          res.body.should.has.property('apiKey').that.be.equal(token);
          done();
        });
    });

    it('It should reset API-Key and return new one', function(done){
      request
        .put(url + '/manage/apikey/reset')
        .set('X-Auth-Token', token)
        .accept('json')
        .send({ apiKey: 'NEW_ABC_API-KEY' })
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').that.be.equal('update accepted');
          res.body.should.have.property('apiKey').that.be.an('string');
          res.body.should.has.property('apiKey').that.be.equal('NEW_ABC_API-KEY');
          done();
        });
    });

  });

  describe('Change administration username:', function(){

    afterEach(function(done){
      request
        .put(url + '/manage/user')
        .set('X-Auth-Token', token)
        .send({ username: 'subkit' })
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
        .send({ username: 'demodemo' })
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
        .send({ username: 'demdemo' })
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
        .send({ username: 'demdemo' })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

  });

  describe('Reset administration password:', function(){

    afterEach(function(done){
      request
        .put(url + '/manage/password/reset')
        .set('X-Auth-Token', token)
        .send({
          password: 'testpass',
          newPassword: 'subkit',
          newPasswordValidation: 'subkit'
        })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').that.be.equal('update accepted');
          done();
        });
    });

    it('It should set administrator`s password', function(done){
      request
        .put(url + '/manage/password/reset')
        .set('X-Auth-Token', token)
        .send({
          password: 'subkit',
          newPassword: 'testpass',
          newPasswordValidation: 'testpass'
        })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').that.be.equal('update accepted');
          done();
        });
    });

  });
  
  describe('Try reset administration password:', function(){
    it('It should`t set administrator`s password if old one is wrong', function(done){
      request
        .put(url + '/manage/password/reset')
        .set('X-Auth-Token', token)
        .send({
          password: 'wrong_password',
          newPassword: 'testpass',
          newPasswordValidation: 'testpass'
        })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(400);
          res.body.should.have.property('message').that.be.equal('Password do not match.');
          done();
        });
    });

    it('It shouldn`t set administrator`s password if token is missing', function(done){
      request
        .put(url + '/manage/password/reset')
        .send({
          password: 'subkit',
          newPassword: 'testpass',
          newPasswordValidation: 'testpass'
        })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('It shouldn`t set administrator`s password if token is wrong', function(done){
      request
        .put(url + '/manage/password/reset')
        .set('X-Auth-Token', 'wrong_token')
        .send({
          password: 'subkit',
          newPassword: 'testpass',
          newPasswordValidation: 'testpass'
        })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

  });

  describe('Get SSL certificates:', function(){

    it('It should get SSL certificate', function(done){
      request
        .get(url + '/manage/certificate')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          res.body.should.have.property('certificate').that.be.a('string');
          res.body.should.have.property('key').that.be.a('string');
          done();
        });
    });

    it('It shouldn`t get SSL certificate if token is missing', function(done){
      request
        .put(url + '/manage/certificate')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('It shouldn`t get SSL certificate if token is wrong', function(done){
      request
        .put(url + '/manage/certificate')
        .set('X-Auth-Token', 'wrong_token')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

  });

  describe('Change SSL certificates:', function(){});

  describe('Process and OS informations:', function(){});

  describe('Kill instance:', function(){});

  describe('Update instance to latest version:', function(){});

  describe('Export documents:', function(){});

  describe('Import documents:', function(){});

  describe('Get Process-Log-File:', function(){});

  describe('Subscribe to Log-Stream:', function(){});

});
