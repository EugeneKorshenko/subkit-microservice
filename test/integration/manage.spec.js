'use strict';

var request = require('superagent');
var fs = require('fs');
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
          res.body.should.have.property('ca').that.be.a('string');
          done();
        });
    });

    it('It shouldn`t get SSL certificate if token is missing', function(done){
      request
        .get(url + '/manage/certificate')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('It shouldn`t get SSL certificate if token is wrong', function(done){
      request
        .get(url + '/manage/certificate')
        .set('X-Auth-Token', 'wrong_token')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

  });

  xdescribe('Change SSL certificates:', function(){

    it('It should change SSL certificate', function(done){
      request
        .put(url + '/manage/certificate')
        .set('X-Auth-Token', token)
        .send({
          certificate: '-----BEGIN CERTIFICATE-----'+
                       '\nMIICATCCAWoCCQDA2JpdPJzLeTANBgkqhkiG9w0BAQUFADBFMQswCQYDVQQGEwJE'+
                       '\nRTETMBEGA1UECBMKU29tZS1TdGF0ZTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0'+
                       '\ncyBQdHkgTHRkMB4XDTE0MDUwMjE0MTQ1MloXDTE1MDUwMjE0MTQ1MlowRTELMAkG'+
                       '\nA1UEBhMCREUxEzARBgNVBAgTClNvbWUtU3RhdGUxITAfBgNVBAoTGEludGVybmV0'+
                       '\nIFdpZGdpdHMgUHR5IEx0ZDCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAsf9y'+
                       '\nT7mKc2rg0d492Ot0QGNrCWXNz8bEv7y0JYKU7oI9BWUislhUR3RG3Nq+S9WjiMGX'+
                       '\nRnufTCKzGBczhOhN1vA7Jb4jVLQ0/hbqr/+AUPg7jZ5bm9XxqgcAPEnWOBCxoJB/'+
                       '\n/uPEJ+2uxusDTf1o6HQbd5wiQK5FAavI1E3E5sMCAwEAATANBgkqhkiG9w0BAQUF'+
                       '\nAAOBgQCqaBxX1rCEkHQn/M8HirCbyLsFvM8JlmApSbrtXNINWpfpTnta4SG/ZZok'+
                       '\niRA7sdhLUFkavmWNRlV7rqFZoLKYfIvFS2r+oRYv8SvrpW4l3yEaU2KmKwmN5hP0'+
                       '\nvrvU9KcKZUfKOAPGSkbnyJAAkIfzLZvQXNzM/zVVn2jkjlgiyQ=='+
                       '\n-----END CERTIFICATE-----',
          key:         '\n-----BEGIN RSA PRIVATE KEY-----'+
                       '\nMIICXQIBAAKBgQCx/3JPuYpzauDR3j3Y63RAY2sJZc3PxsS/vLQlgpTugj0FZSKy'+
                       '\nWFRHdEbc2r5L1aOIwZdGe59MIrMYFzOE6E3W8DslviNUtDT+Fuqv/4BQ+DuNnlub'+
                       '\n1fGqBwA8SdY4ELGgkH/+48Qn7a7G6wNN/WjodBt3nCJArkUBq8jUTcTmwwIDAQAB'+
                       '\nAoGBAJSplP+hJ1FeYobl5yHVBTMB1dPzgwGWMZ0yLgNmHJ1XiT+ISIJL45gKNWUg'+
                       '\nDO+pbvw5M+9aMKGWGZ51QkIvA1Ksd+NHWfh9bsZ3KOHlC8qKrCdjVNiXOL1C29yb'+
                       '\nYkZzZsjCIOKqS0sEwZHQXe0wlQFD1l7y+qWuiM8nEZ9NzBEBAkEA28ZPLrxSV9hP'+
                       '\nqNTRrREUXRIfIdb5TVvRvkKnEZKFFJv558MvDR0XCoNd/CyuVHtasMEOtysIzxaK'+
                       '\nSjL5fEO4iQJBAM9WTtGREMTLHXPs5J4ZtK5cwbOv1P0XqEM8M3SVjoPXtUjVL0WQ'+
                       '\nJH48vXvl03NWiMhn8PhNYlVZIZ/XhwJkOesCQQCfWwvPN339dDtOkAH5G4lIcvtf'+
                       '\n7iCWlx1ed7XsZ/FXIEH0avKS76TlWpurXjqJx2fbAiFJb0rT3eQoKQ39rJ0BAkBP'+
                       '\nF3VprBThfTn3Bt8PEG9ENE4P5XsyMNwXCdf3GTYMRTT6W5h0yM+i+DiwErPew5va'+
                       '\nFwxtK9ffBuk0uFrgJquRAkB9jqGZ/XNtFqbZVFU8DTKNKMlQTER0pBuaVqH4J6qH'+
                       '\nxp0I5OIDwwP3CMqnVVJN03K08FVQV7NLvXkU0PkKtyM6'+
                       '\n-----END RSA PRIVATE KEY-----',
          ca:          '-----BEGIN RSA PRIVATE KEY-----'+
                       '\nProc-Type: 4,ENCRYPTED'+
                       '\nDEK-Info: DES-EDE3-CBC,1058713A07028202'+
                       '\n'+
                       '\nxn6JwUEekQW7Evjdbn+ei0zeuU1OJjKTyX1IgItraDRlQl7btDDfhdXlECeZRR80'+
                       '\nZA3EahwpSFF0ouLbpUvgdTb9iT8ZttWyDqRAD0FKv6s+pFJVmy8Q/RrSADIW6Bkb'+
                       '\ncO5ZuJsIzBTtU03H7YyTUQ8/IQKegjGL/bTTqq2vwVQJil2+B9/UYHc90DKh7HL5'+
                       '\no5S/wr5i/+U1VxXPA9On5uTW/4iK1wZqrBreLTd3OrwsXQOHsF6ZMUqEGKMkIg6G'+
                       '\nFahUTxBEZJW4MhHnU42Hkwqm1ytjR6PjPb9HgqqpfYpYl59A+m+fLWCLgygy4tkK'+
                       '\nBD3QxZUHNssOqiRmsLAD0yI3DmlzXOlfqx8KsCJ/HA5yzpC9i11qT+joZYQxBCF9'+
                       '\nNN9E6FuVGvLC7ScFjCMrlQG8b43MCeDVEhRdxupwSgtq6lfQFEBc5R3ClIHT0/Yw'+
                       '\noX3eUI5w+3VC9wUlbIJJx8hlLmTSjDRI0UNAYXZw51m/JFgZbxPql5cWrIDmkJLH'+
                       '\ndoJDpLn4uC/R+0O4AevlMOO15IOBKqMYi3J3PhS0R9izGTQUGQZ7e8adLhbRqXf0'+
                       '\nO4NmLnhLWruN9+FzkzJjP5NBjj8OPuOQi3Owf6TqNg+6oJxHNCeJSZaYxz88muEA'+
                       '\nHruNyiDDRWEiIe0Panv/hNQmdkC4ePBIrmX54Bbb0S93NAxqhf3c3+e/bsGLIRGY'+
                       '\nfgwSOK0RXXd84Ot2Aud5/w+wJAcRADx1W56ANnz+9p9weWPnY5ziF4IKt2u4pNBK'+
                       '\nTJFGlNIFVwJ6yY5vkvrbBxfJJgjO4l0d8Xb+BNm39B5YcyvzQfSt/b+aXJpYGX0g'+
                       '\ncuWTcwfTETW1gccsicsYiMaykHwDkzCkqFtOx/grpUpC785I53KLHUEP/0g9yD+n'+
                       '\nCJaVW/YmaiobRe3gl0M7RCAYL8/sBMeS1qZk/3OeImRQYU0ujGSh3pG1SF9vdNL9'+
                       '\nmY9EFeeeSM5nN4h/NKtjBIIn8X7WXB51mAvHF6g58PTAHa85y6EU6AQTkNVUdql4'+
                       '\nxNST8+tccHhPKWRsTah4W5gnDX1QslzrEZ3//9GdQ/FGljV/63Hnzk12Zsc7Okjw'+
                       '\nlxtxJc4ajjq6nPTzZr7Q14sLsScLWY6kCWF8Zcbm+S5PWqfyFDzAp9s11zXsS7Dk'+
                       '\noxdKnaWkzSB05di6ckmDRRDdZ8LIufdK0d5eKSuvXnHHeW/UHMiXdg3A97dqTrFc'+
                       '\nxz/EqmOdNfg4ZnLBQmrSxn4fx9YuNT/xbuHI/PZwo5jaH6RnTPZWFXvL4i5jj2ve'+
                       '\npWwFQNpNbEK6hQNqgKp7hcmmvvoHP/loYvZqd3VDM6YdyDP9kGF58GCnRRSfNqDR'+
                       '\nuQWY/BWzpgbX2FAVKQ2x+tdcOGm4ICwg7YgIKSeeSY+Q03smPULzSrwsebNMbr3V'+
                       '\njXT1BGxMOZjaNInik3BpQFUpI3aQUNN7/FQjmxU/Udc/GsoTWwqa/ja/csni2Hfm'+
                       '\nI7GI5b7uXivbI/nJKI8rS4oqN6JfKQhWDtps/QJn5T1LnIT2ycTZTROizfUBRvxv'+
                       '\nGn1Wzo2EOckQ+jWZ6kKpeVLNy4EozDSbIg920ZXuRwPPsbfOavJaMeeJqeoxlxIt'+
                       '\n-----END RSA PRIVATE KEY-----'
        })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          res.body.should.have.property('message').that.be.equal('update accepted');
          done();
        });
    });

    it('It shouldn`t change SSL certificate if token is missing', function(done){
      request
        .put(url + '/manage/certificate')
        .send({
          certificate: '',
          key: '',
          ca: ''
        })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('It shouldn`t change SSL certificate if token is wrong', function(done){
      request
        .put(url + '/manage/certificate')
        .set('X-Auth-Token', 'wrong_token')
        .send({
          certificate: '',
          key: '',
          ca: ''
        })
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

  });

  xdescribe('Process and OS informations:', function(){});

  xdescribe('Kill instance:', function(){});

  xdescribe('Update instance to latest version:', function(){});

  describe('Export documents:', function(){
    beforeEach(function(done){
      request
        .post(url + '/stores/Scores/1c9f4c3e-86bb-11e4-b116-123b93f75cba12')
        .send({
          'score': 1876,
          'playerName': 'Karl in scores',
          'cheatMode': false
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(201);
          request
            .post(url + '/stores/Extras/1c9f4c3e-86bb-11e4-b116-123b93f75cba12345345')
            .send({
              'score': 1876,
              'playerName': 'Karl in extras',
              'cheatMode': false
            })
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function(res){
              res.status.should.be.equal(201);
              done();
            });
        });
    });

    afterEach(function(done){
      request
        .del(url + '/stores/Scores/1c9f4c3e-86bb-11e4-b116-123b93f75cba12')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          request
            .del(url + '/stores/Extras/1c9f4c3e-86bb-11e4-b116-123b93f75cba12345345')
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function(res){
              res.status.should.be.equal(202);
              done();
            });
        });
    });

    it('It should exports all documents', function(done){
      request
        .get(url + '/manage/export')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          done();
        });
    });

    it('It should exports all documents from specific store', function(done){
      request
        .get(url + '/manage/export/Extras')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(200);
          done();
        });
    });

    it('It should not exports all documents with wrong api key', function(done){
      request
        .get(url + '/manage/export')
        .set('X-Auth-Token', 'wrong')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('It should not exports all documents from specific store with wrong api key', function(done){
      request
        .get(url + '/manage/export/Extras')
        .set('X-Auth-Token', 'wrong')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('It should not exports all documents without api key', function(done){
      request
        .get(url + '/manage/export')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('It should not exports all documents from specific store without api key', function(done){
      request
        .get(url + '/manage/export/Extras')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });
  });

  describe('Import documents:', function(){
    beforeEach(function(done){
      request
        .del(url + '/stores/Scores/test_key_one')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          request
            .del(url + '/stores/Extras/test_key_two')
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function(res){
              res.status.should.be.equal(202);
              request
                .del(url + '/stores/Scores/test_key_two')
                .set('X-Auth-Token', token)
                .accept('json')
                .end(function(res){
                  res.status.should.be.equal(202);
                  done();
                });
            });
        });
    });

    afterEach(function(done){
      request
        .del(url + '/stores/Scores/test_key_one')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(202);
          request
            .del(url + '/stores/Extras/test_key_two')
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function(res){
              res.status.should.be.equal(202);
              request
                .del(url + '/stores/Scores/test_key_two')
                .set('X-Auth-Token', token)
                .accept('json')
                .end(function(res){
                  res.status.should.be.equal(202);
                  done();
                });
            });
        });
    });

    it('It should Import via JSON data file', function(done){
      var stream = fs.createReadStream('./test/integration/fixtures/docs_for_import_store.json');
      var req = request
        .post(url + '/manage/import')
        .set('X-Auth-Token', token)
        .type('application/octed-stream')
        .accept('json')
        .parse( function (res) {
          res.on('data', function (chunk) {
            var chunk = JSON.parse(chunk.toString());
            chunk.should.have.property('message').that.be.equal('imported');
            request
              .get(url + '/stores/Scores/test_key_one')
              .set('X-Auth-Token', token)
              .accept('json')
              .end(function(res){
                res.status.should.be.equal(200);
                request
                  .get(url + '/stores/Extras/test_key_two')
                  .set('X-Auth-Token', token)
                  .accept('json')
                  .end(function(res){
                    res.status.should.be.equal(200);
                    req.abort();
                    done();
                  });
              });
          });
        });
      stream.pipe(req);
    });

    it('It should Import via JSON body', function(done){
      request
        .post(url + '/manage/import')
        .send({"payload": [
          {
            "key": "test_key_one",
            "value":{
              "score": 500,
              "playerName": "Karl",
              "cheatMode": false,
              "foo": "bar",
              "typedField": 1
            },
            "store":"Scores"
          },
          {
            "key": "test_key_two",
            "value": {
              "score": 100,
              "playerName": "Berta",
              "cheatMode": true,
              "foo": "bar",
              "typedField": 1
            },
            "store":"Extras"
          }
        ]})
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(201);
          res.body.should.have.property('message').that.be.equal('imported');
          request
            .get(url + '/stores/Scores/test_key_one')
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function(res){
              res.status.should.be.equal(200);
              request
                .get(url + '/stores/Extras/test_key_two')
                .set('X-Auth-Token', token)
                .accept('json')
                .end(function(res){
                  res.status.should.be.equal(200);
                  done();
                });
            });
        });
    });

    it('It should Import via JSON data file to specific store', function(done){
      var stream = fs.createReadStream('./test/integration/fixtures/docs_for_import.json');
      var req = request
        .post(url + '/manage/import/Scores')
        .set('X-Auth-Token', token)
        .type('application/octed-stream')
        .accept('json')
        .parse( function (res) {
          res.on('data', function (chunk) {
            var chunk = JSON.parse(chunk.toString());
            chunk.should.have.property('message').that.be.equal('imported');
            request
              .get(url + '/stores/Scores/test_key_one')
              .set('X-Auth-Token', token)
              .accept('json')
              .end(function(res){
                res.status.should.be.equal(200);
                request
                  .get(url + '/stores/Extras/test_key_two')
                  .set('X-Auth-Token', token)
                  .accept('json')
                  .end(function(res){
                    res.status.should.be.equal(400);
                    req.abort();
                    request
                      .get(url + '/stores/Scores/test_key_two')
                      .set('X-Auth-Token', token)
                      .accept('json')
                      .end(function(res){
                        res.status.should.be.equal(200);
                        req.abort();
                        done();
                      });
                  });
              });
          });
        });
      stream.pipe(req);
    });

    it('It should Import via JSON body to specific store', function(done){
      request
        .post(url + '/manage/import/Scores')
        .send({"payload": [
          {
            "key": "test_key_one",
            "value": {
              "score": 500,
              "playerName": "Karl",
              "cheatMode": false,
              "foo": "bar",
              "typedField": 1
            }
          },
          {
            "key": "test_key_two",
            "value": {
              "score": 100,
              "playerName": "Berta",
              "cheatMode": true,
              "foo": "bar",
              "typedField": 1
            }
          }
        ]})
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(201);
          res.body.should.have.property('message').that.be.equal('imported');
          request
            .get(url + '/stores/Scores/test_key_one')
            .set('X-Auth-Token', token)
            .accept('json')
            .end(function(res){
              res.status.should.be.equal(200);
              request
                .get(url + '/stores/Extras/test_key_two')
                .set('X-Auth-Token', token)
                .accept('json')
                .end(function(res){
                  res.status.should.be.equal(400);
                  request
                    .get(url + '/stores/Scores/test_key_two')
                    .set('X-Auth-Token', token)
                    .accept('json')
                    .end(function(res){
                      res.status.should.be.equal(200);
                      done();
                    });
                });
            });
        });
    });

    it('It should not Import all documents without api key', function(done){
      request
        .post(url + '/manage/import')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

    it('It should not Import all documents from specific store without api key', function(done){
      request
        .post(url + '/manage/import/Extras')
        .accept('json')
        .end(function(res){
          res.status.should.be.equal(401);
          done();
        });
    });

  });

  describe('Get Process-Log-File:', function(){});

  describe('Subscribe to Log-Stream:', function(){});

});
