'use strict';

var chai    = require('chai');
var request = require('superagent');
var fs      = require('fs');
var path    = require('path');

chai.should();
chai.use(require('chai-things'));

var url = 'https://localhost:8080';
var token = '66LOHAiB8Zeod1bAeLYW';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Smoke: Event-Projections', function () {
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

  describe('Run Event-Log projection', function () {
    beforeEach(function(done){
      var scriptPath = path.join(__dirname, './fixtures/gauss_sum_task.js');
      var script = fs.readFileSync(scriptPath, 'utf8');

      createEventLogProjectionTask('mystream_persistent_projection', script, function(){
        done();
      });
    });
    afterEach(function(done){
      //Clean-up: delete the created persistent event stream
        deletePersistentEventHistory('mystream_persistent', function(){
          
          deletePersistentEventHistory('mystream_persistent_other', function(){
            
            deleteEventLogProjectionTask('mystream_persistent_projection', function(){
              done();
            });
          
          });
        
        });
    });

    it('Emit 100 events and start a Gauss-Sum event-log projection', function(done){
      var count = 100;
      for (var i = 1; i <= count; emitPersistentEvent('mystream_persistent', i++)){}
      runEventLogProjectionTask(function(err, data){
        data.should.have.property('msg').and.be.equal('done');
        data.should.have.property('count').and.be.equal(100);
        data.should.have.property('gauss_sum').and.be.equal(5050);
        done();
      });
    });

    it('Emit 100 events in two different streams and start a Gauss-Sum event-log projection', function(done){
      var count = 100;      
      for (var i = 1; i <= count; emitPersistentEvent('mystream_persistent', i++)){}

      setTimeout(function(){
        for (var i = 1; i <= count; emitPersistentEvent('mystream_persistent_other', i++)){}
      }, 1000);

      setTimeout(function(){

        runEventLogProjectionTask(function(err, data){
          data.should.have.property('msg').and.be.equal('done');
          data.should.have.property('count').and.be.equal(200);
          data.should.have.property('gauss_sum').and.be.equal(10100);
          done();
        });

      }, 2000);

    });

  });

  function emitPersistentEvent(stream, i) {
    request
      .post(url + '/events/emit/' + stream)
      .set('x-subkit-event-persistent', true)
      .set('X-Auth-Token', token)
      .send({number: i, foo:'ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum, ipsumlarum'})
      .accept('json')
      .end(function (res) {
        res.status.should.be.equal(201);
        res.body.should.have.property('message').and.be.equal('emitted');
      });
  }

  function deletePersistentEventHistory(stream, done){
    request
      .del(url + '/events/history/' + stream)
      .set('X-Auth-Token', token)
      .accept('json') 
      .end(function(res){
        res.status.should.be.equal(202);
        res.body.should.have.property('message').and.be.equal('delete accepted');
        done();        
      }); 
  }

  function createEventLogProjectionTask(taskName, script, done) {
    request
      .post(url + '/tasks/' + taskName)
      .set('X-Auth-Token', token)
      .send({
        taskScript: script
      })
      .accept('json')
      .end(function (res) {
        res.status.should.be.equal(201);
        res.body.should.have.property('message').and.be.equal('created');
        done();
      });
  }

  function deleteEventLogProjectionTask(taskName, done) {
    request
      .del(url + '/tasks/' + taskName)
      .set('X-Auth-Token', token)
      .accept('json')
      .end(function (res) {
        res.status.should.be.equal(202);
        res.body.should.have.property('message').and.be.equal('delete accepted');
        done();
      });
  }

  function runEventLogProjectionTask(done) {
    request
      .get(url + '/tasks/api/mystream_persistent_projection')
      .set('X-Auth-Token', token)
      .send()
      .accept('json')
      .end(function (res) {
        res.status.should.be.equal(200);
        done(null, res.body);
      });
  }

});


