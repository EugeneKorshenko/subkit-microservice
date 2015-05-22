'use strict';

//var assert = require('assert'),
//    restify = require('restify'),
//    path = require('path');

var request = require('superagent');
var chai = require('chai');
var path = require('path');
var async = require('async');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-array'));

var url = 'https://localhost:8080';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var token = '66LOHAiB8Zeod1bAeLYW';

//var client = restify.createJsonClient({
//  version: '*',
//  rejectUnauthorized: false,
//  url: 'https://127.0.0.1:8080',
//  headers: {'x-auth-token':'66LOHAiB8Zeod1bAeLYW'}
//});

function createTask(name, taskScript, next) {
  request
    .post(url + '/tasks/' + name)
    .send({
      taskScript: taskScript
    })
    .set('X-Auth-Token', token)
    .accept('json')
    .end(function() {
      if(next) next();
    });
}

function deleteTask(name, next) {
  request
    .del(url + '/tasks/' + name)
    .set('X-Auth-Token', token)
    .accept('json')
    .end(function() {
      if(next) next();
    });
}

describe('Integration: Task', function(){
  var server,
      context;

  before(function(done) {
    server = require('../../server.js');
    context = server.init().getContext();
    context.task.init({
      tasksPath: path.join(__dirname, './task_mock'),
    });
    done();
  });
  after(function(done){
    context.storage.close();
    context.server.close();
    delete require.cache[server];
    done();
  });

  describe('Manage tasks:', function() {

    before(function(done) {
      async.waterfall([
        function(cb) {
          createTask('deleteTestTask', 'task.debug(\"hello subkit\"); task.done(null,{hello:\"subkit\",parameters:task.params });', cb);
        },
        function(cb) {
          createTask('updateTestTask', 'task.debug(\"hello subkit\"); task.done(null,{hello:\"subkit\",parameters:task.params });', cb);
        },
        function(cb) {
          createTask('getTestTask', 'task.debug(\"hello subkit\"); task.done(null,{hello:\"subkit\",parameters:task.params });', cb);
        },
        function(cb) {
          createTask('runTestTask', 'task.debug(\"hello subkit\"); task.done(null,{hello:\"subkit\",parameters:task.params });', cb);
        },
        function(cb) {
          createTask('timeoutErrorTask', 'setTimeout(function(){task.done();}, 32000);', cb);
        },
        function(cb) {
          createTask('executeErrorTask', 'task.done(new Error(\"Test error occured\"));', cb);
        },
        function(cb) {
          createTask('executeThrowErrorTask', 'throw new Error(\"Error thrown\");', cb);
        },
        function(cb) {
          createTask('serverFreezeTask', 'while(1) {}', cb);
        }
      ], function() {
        done();
      });
    });
    after(function(done) {
      async.waterfall([
        function(cb) {
          deleteTask('createTestTask', cb);
        },
        function(cb) {
          deleteTask('updateTestTask', cb);
        },
        function(cb) {
          deleteTask('getTestTask', cb);
        },
        function(cb) {
          deleteTask('runTestTask', cb);
        },
        function(cb) {
          deleteTask('timeoutErrorTask', cb);
        },
        function(cb) {
          deleteTask('executeErrorTask', cb);
        },
        function(cb) {
          deleteTask('executeThrowErrorTask', cb);
        },
        function(cb) {
          deleteTask('nonexistentTask', cb);
        },
        function(cb) {
          deleteTask('serverFreezeTask', cb);
        },
        function(cb) {
          deleteTask('withoutTaskScriptTask', cb);
        },
        function(cb) {
          deleteTask('emptyTaskScriptTask', cb);
        }
      ], function() {
        done();
      });
    });

    it('should show list of tasks', function(done) {
      request
        .get(url + '/tasks')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(200);
          res.body.should.have.property('results').and.be.an('array');
          res.body.results.should.have.deep.property('[0].name');
          res.body.results.should.have.deep.property('[0].key');
          done();
        });
    });

    it('should create task', function (done) {
      request
        .post(url + '/tasks/createTestTask')
        .send({
          taskScript: 'task.debug(\"hello subkit\"); task.done(null,{hello:\"subkit\",parameters:task.params });'
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(201);
          res.body.should.has.property('message').that.be.equal('created');
          done();
        });
    });

    it('should not create task without taskScript', function (done) {
      request
        .post(url + '/tasks/withoutTaskScriptTask')
        .send({})
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.not.equal(201);
          res.body.should.has.property('message').that.be.not.equal('created');
          done();
        });
    });

    it('should not create task with empty taskScript', function (done) {
      request
        .post(url + '/tasks/emptyTaskScriptTask')
        .send({
          taskScript: ''
        })
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.not.equal(201);
          res.body.should.has.property('message').that.be.not.equal('created');
          done();
        });
    });

    it('should not create task without valid x-auth-token', function (done) {
      request
        .post(url + '/tasks/emptyTaskScriptTask')
        .send({
          taskScript: ''
        })
        .set('X-Auth-Token', '')
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(401);
          res.body.should.has.property('message').that.be.equal('Unauthorized');
          done();
        });
    });

    it('should get task body', function(done) {
      request
        .get(url + '/tasks/getTestTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(200);
          res.body.should.include.keys(['name', 'continuous', 'taskScript', 'anonymous']);
          res.body.should.has.property('name').that.be.equal('getTestTask');
          res.body.should.has.property('continuous').that.be.equal(false);
          res.body.should.has.property('anonymous').that.be.equal(false);
          done();
        });
    });

    it('should not get task body without valid x-auth-token', function(done) {
      request
        .get(url + '/tasks/getTestTask')
        .set('X-Auth-Token', '')
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(401);
          res.body.should.has.property('message').that.be.equal('Unauthorized');
          done();
        });
    });

    it('should not get body of nonexistent task', function(done) {
      request
        .get(url + '/tasks/nonexistentTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(400);
          res.body.should.has.property('message').that.be.equal('Task does not exists');
          done();
        });
    });

    it('should update task', function (done) {
      request
        .put(url + '/tasks/updateTestTask')
        .set('X-Auth-Token', token)
        .send({
          taskScript: 'task.done(null, { hello: \"world\" });'
        })
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(202);
          res.body.should.has.property('message').that.be.equal('update accepted');
          done();
        });
    });

    it('should not update nonexistent task', function (done) {
      request
        .put(url + '/tasks/nonexistentTask')
        .set('X-Auth-Token', token)
        .send({
          taskScript: 'task.done(null, { hello: \"world\" });'
        })
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(400);
          res.body.should.has.property('message').that.be.equal('Task does not exists');
          done();
        });
    });

    it('should not update task without valid x-auth-token', function (done) {
      request
        .put(url + '/tasks/updateTestTask')
        .set('X-Auth-Token', '')
        .send({
          taskScript: 'task.done(null, { hello: \"world\" });'
        })
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(401);
          res.body.should.has.property('message').that.be.equal('Unauthorized');
          done();
        });
    });

    it('task should not be updated with an empty taskScript', function (done) {
      request
        .put(url + '/tasks/updateTestTask')
        .set('X-Auth-Token', token)
        .send({
          taskScript: ''
        })
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(400);
          res.body.should.has.property('message').that.be.not.equal('update accepted');
          done();
        });
    });

    it('task should not be updated with an empty request', function (done) {
      request
        .put(url + '/tasks/updateTestTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(500);
          res.body.should.has.property('message').that.be.not.equal('update accepted');
          done();
        });
    });

    it('should not delete task without valid x-auth-token', function(done) {
      request
        .del(url + '/tasks/deleteTestTask')
        .set('X-Auth-Token', '')
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(401);
          res.body.should.has.property('message').that.be.equal('Unauthorized');
          done();
        });
    });

    it('should delete task', function(done) {
      request
        .del(url + '/tasks/deleteTestTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(202);
          res.body.should.has.property('message').that.be.equal('delete accepted');
          done();
        });
    });

    it('should not delete nonexistent task', function(done) {
      request
        .del(url + '/tasks/nonexistentTaskTest')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(400);
          res.body.should.has.property('message').that.be.not.equal('delete accepted');
          done();
        });
    });

    it('should run task via GET request', function (done) {
      request
        .get(url + '/api/runTestTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(200);
          res.body.should.include.keys(['hello', 'parameters']);
          res.body.should.has.property('hello').that.be.equal('subkit');
          res.body.should.have.property('parameters').and.be.an('object');
          res.body.parameters.should.has.property('0').that.be.equal('runTestTask');
          done();
        });
    });

    it('should run task via GET request with query parameters', function (done) {
      request
        .get(url + '/api/runTestTask?first=demo')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(200);
          res.body.should.include.keys(['hello', 'parameters']);
          res.body.should.has.property('hello').that.be.equal('subkit');
          res.body.should.have.property('parameters').and.be.an('object');
          res.body.parameters.should.has.property('0').that.be.equal('runTestTask');
          res.body.parameters.should.has.property('1').that.be.equal('');
          res.body.parameters.should.has.property('first').that.be.equal('demo');
          done();
        });
    });

    it('should not run task via GET request without valid x-auth-token', function (done) {
      request
        .get(url + '/api/runTestTask')
        .set('X-Auth-Token', '')
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(401);
          res.body.should.has.property('message').that.be.equal('Unauthorized');
          done();
        });
    });

    it('should not run nonexistent task via GET request', function (done) {
      request
        .get(url + '/api/runNonexistentTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(500);
          done();
        });
    });

    it('should run task via POST request', function (done) {
      request
        .post(url + '/api/runTestTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(200);
          res.body.should.include.keys(['hello', 'parameters']);
          res.body.should.has.property('hello').that.be.equal('subkit');
          res.body.should.have.property('parameters').and.be.an('object');
          res.body.parameters.should.has.property('0').that.be.equal('runTestTask');
          done();
        });
    });

    it('should run task via POST request with JSON body parameter', function (done) {
      request
        .post(url + '/api/runTestTask')
        .set('X-Auth-Token', token)
        .send({
          first: 'demo'
        })
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(200);
          res.body.should.include.keys(['hello', 'parameters']);
          res.body.should.has.property('hello').that.be.equal('subkit');
          res.body.should.have.property('parameters').and.be.an('object');
          res.body.parameters.should.has.property('0').that.be.equal('runTestTask');
          res.body.parameters.should.has.property('1').that.be.equal('');
          res.body.parameters.should.has.property('first').that.be.equal('demo');
          done();
        });
    });

    it('should not run task via POST request without valid x-auth-token', function (done) {
      request
        .post(url + '/api/runTestTask')
        .set('X-Auth-Token', '')
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(401);
          res.body.should.has.property('message').that.be.equal('Unauthorized');
          done();
        });
    });

    it('should not run nonexistent task via POST request', function (done) {
      request
        .post(url + '/api/runNonexistentTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(500);
          done();
        });
    });

    it('should run task via PUT request', function (done) {
      request
        .put(url + '/api/runTestTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(200);
          res.body.should.include.keys(['hello', 'parameters']);
          res.body.should.has.property('hello').that.be.equal('subkit');
          res.body.should.have.property('parameters').and.be.an('object');
          res.body.parameters.should.has.property('0').that.be.equal('runTestTask');
          done();
        });
    });

    it('should run task via PUT request with JSON body parameter', function (done) {
      request
        .put(url + '/api/runTestTask')
        .set('X-Auth-Token', token)
        .send({
          first: 'demo'
        })
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(200);
          res.body.should.include.keys(['hello', 'parameters']);
          res.body.should.has.property('hello').that.be.equal('subkit');
          res.body.should.have.property('parameters').and.be.an('object');
          res.body.parameters.should.has.property('0').that.be.equal('runTestTask');
          res.body.parameters.should.has.property('1').that.be.equal('');
          res.body.parameters.should.has.property('first').that.be.equal('demo');
          done();
        });
    });

    it('should not run task via PUT request without valid x-auth-token', function (done) {
      request
        .put(url + '/api/runTestTask')
        .set('X-Auth-Token', '')
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(401);
          res.body.should.has.property('message').that.be.equal('Unauthorized');
          done();
        });
    });

    it('should not run nonexistent task via PUT request', function (done) {
      request
        .put(url + '/api/runNonexistentTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(500);
          done();
        });
    });

    it('should run task via HEAD request', function (done) {
      request
        .head(url + '/api/runTestTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(200);
          done();
        });
    });

    it('should run task via HEAD request with query parameters', function (done) {
      request
        .head(url + '/api/runTestTask?first=demo')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(200);
          done();
        });
    });

    it('should not run task via HEAD request without valid x-auth-token', function (done) {
      request
        .head(url + '/api/runTestTask')
        .set('X-Auth-Token', '')
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(401);
          done();
        });
    });

    it('should not run nonexistent task via HEAD request', function (done) {
      request
        .head(url + '/api/runNonexistentTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(500);
          done();
        });
    });

    it('should run task via DELETE request', function (done) {
      request
        .del(url + '/api/runTestTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(200);
          res.body.should.include.keys(['hello', 'parameters']);
          res.body.should.has.property('hello').that.be.equal('subkit');
          res.body.should.have.property('parameters').and.be.an('object');
          res.body.parameters.should.has.property('0').that.be.equal('runTestTask');
          done();
        });
    });

    it('should not run task via DELETE request without valid x-auth-token', function (done) {
      request
        .del(url + '/api/runTestTask')
        .set('X-Auth-Token', '')
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(401);
          res.body.should.has.property('message').that.be.equal('Unauthorized');
          done();
        });
    });

    it('should not run nonexistent task via DELETE request', function (done) {
      request
        .del(url + '/api/runNonexistentTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(500);
          done();
        });
    });

    it('should subscribe to task debug messages and response with debug message for every request (9 requests)', function(done) {
      var req = request
        .get(url + '/events/stream/runTestTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .parse( function (res) {
          var messagesCount = 0;
          res.on('data', function(chunk) {
            var result = JSON.parse(chunk.toString());
            result.should.be.an('array').and.have.length(1);
            result[0].should.include.keys(['$key','$metadata','$name','$payload','$persistent','$stream']);
            result.should.have.deep.property('[0].$metadata').to.be.an('object');
            result.should.have.deep.property('[0].$name').to.be.equal('runTestTask');
            result.should.have.deep.property('[0].$payload').to.be.equal('hello subkit');
            result.should.have.deep.property('[0].$persistent').to.be.equal(false);
            result.should.have.deep.property('[0].$stream').to.be.equal('runTestTask');
            messagesCount++;
            if(messagesCount === 9) {
              req.abort();
              done();
            }
          });
        })
        .end();
    });

    it('should execute error task', function(done) {
      request
        .get(url + '/api/executeErrorTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(500);
          res.body.should.have.property('message').and.be.equal('Test error occured');
          done();
        });
    });

    it('should execute throw error task', function(done) {
      request
        .get(url + '/api/executeThrowErrorTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(500);
          res.body.should.have.property('message').and.be.equal('Error thrown');
          done();
        });
    });

    it('should execute timeout error task', function(done) {
      this.timeout(35000);
      request
        .get(url + '/api/timeoutErrorTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(500);
          res.body.should.have.property('message').and.be.equal('Timeout - timeoutErrorTask do not done.');
          done();
        });
    });

    xit('task should not freeze server (each task must be executed in separated node process)', function (done) {
      this.timeout(35000);
      request
        .get(url + '/api/serverFreezeTask')
        .set('X-Auth-Token', token)
        .accept('json')
        .end(function(res) {
          res.status.should.be.equal(500);
          res.body.should.have.property('message').and.be.equal('Error task');
          done();
        });
    });

  });


  //describe('Manage tasks', function(){
  //
  //  it('should manage task', function(done){
  //    client.post('/tasks/demo1', null, function(err, req, res, obj) {
  //      assert.equal(null, err);
  //      assert.notEqual(null, obj);
  //      assert.equal('created', obj.message);
  //
  //      client.get('/tasks/demo1', function(err, req, res, obj){
  //        assert.equal(null, err);
  //        assert.notEqual(null, obj);
  //        assert.notEqual('', obj.name);
  //
  //        obj.taskScript = 'task.done(null,{});';
  //        client.put('/tasks/demo1', obj, function(err, req, res, obj){
  //          assert.equal(null, err);
  //          assert.notEqual(null, obj);
  //          assert.notEqual('', obj.taskScript);
  //          assert.equal('update accepted', obj.message);
  //
  //          client.del('/tasks/demo1', function(err, req, res, obj) {
  //            assert.equal(null, err);
  //            assert.notEqual(null, obj);
  //            assert.equal('delete accepted', obj.message);
  //            done();
  //          });
  //
  //        });
  //
  //      });
  //    });
  //  });
  //
  //  it('should execute error task', function(done){
  //    client.post('/tasks/error1', null, function(err, req, res, obj) {
  //      assert.equal(null, err);
  //      assert.notEqual(null, obj);
  //      assert.equal('created', obj.message);
  //
  //      client.get('/tasks/error1', function(err, req, res, obj){
  //        assert.equal(null, err);
  //        assert.notEqual(null, obj);
  //        assert.notEqual('', obj.name);
  //
  //        obj.taskScript = 'task.done(new Error("Test error occured"));';
  //        client.put('/tasks/error1', obj, function(err, req, res, obj){
  //          assert.equal(null, err);
  //          assert.notEqual(null, obj);
  //          assert.notEqual('', obj.taskScript);
  //          assert.equal('update accepted', obj.message);
  //
  //
  //          client.get('/api/error1', function(err, req, res, obj){
  //            assert.equal(res.statusCode, 500);
  //            assert.equal('Test error occured', err.body.message);
  //            assert.equal('Test error occured', obj.message);
  //
  //            client.del('/tasks/error1', function(err, req, res, obj) {
  //              assert.equal(null, err);
  //              assert.notEqual(null, obj);
  //              assert.equal('delete accepted', obj.message);
  //              done();
  //            });
  //
  //          });
  //
  //        });
  //
  //      });
  //    });
  //  });
  //
  //  it('should execute timeout error task', function(done){
  //    this.timeout(35000);
  //
  //    client.post('/tasks/timeout1', null, function(err, req, res, obj) {
  //      assert.equal(null, err);
  //      assert.notEqual(null, obj);
  //      assert.equal('created', obj.message);
  //
  //      client.get('/tasks/timeout1', function(err, req, res, obj){
  //        assert.equal(null, err);
  //        assert.notEqual(null, obj);
  //        assert.notEqual('', obj.name);
  //
  //        obj.taskScript = 'setTimeout(function(){task.done();}, 32000);';
  //        client.put('/tasks/timeout1', obj, function(err, req, res, obj){
  //          assert.equal(null, err);
  //          assert.notEqual(null, obj);
  //          assert.notEqual('', obj.taskScript);
  //          assert.equal('update accepted', obj.message);
  //
  //
  //          client.get('/api/timeout1', function(err, req, res, obj){
  //            assert.equal(res.statusCode, 500);
  //            assert.equal('Timeout - timeout1 do not done.', err.body.message);
  //            assert.equal('Timeout - timeout1 do not done.', obj.message);
  //
  //            client.del('/tasks/timeout1', function(err, req, res, obj) {
  //              assert.equal(null, err);
  //              assert.notEqual(null, obj);
  //              assert.equal('delete accepted', obj.message);
  //              done();
  //            });
  //
  //          });
  //
  //        });
  //
  //      });
  //    });
  //  });
  //
  //  it('should execute throw error task', function(done){
  //    client.post('/tasks/throw1', null, function(err, req, res, obj) {
  //      assert.equal(null, err);
  //      assert.notEqual(null, obj);
  //      assert.equal('created', obj.message);
  //
  //      client.get('/tasks/throw1', function(err, req, res, obj){
  //        assert.equal(null, err);
  //        assert.notEqual(null, obj);
  //        assert.notEqual('', obj.name);
  //
  //        obj.taskScript = 'throw new Error("Error thrown");';
  //        client.put('/tasks/throw1', obj, function(err, req, res, obj){
  //          assert.equal(null, err);
  //          assert.notEqual(null, obj);
  //          assert.notEqual('', obj.taskScript);
  //          assert.equal('update accepted', obj.message);
  //
  //
  //          client.get('/api/throw1', function(err, req, res, obj){
  //            assert.equal(res.statusCode, 500);
  //            assert.equal('Error thrown', err.body.message);
  //            assert.equal('Error thrown', obj.message);
  //
  //            client.del('/tasks/throw1', function(err, req, res, obj) {
  //              assert.equal(null, err);
  //              assert.notEqual(null, obj);
  //              assert.equal('delete accepted', obj.message);
  //              done();
  //            });
  //
  //          });
  //
  //        });
  //
  //      });
  //    });
  //  });
  //
  //  it('should execute task with debug messages', function(done){
  //
  //    var rawClient = restify.createClient({
  //      rejectUnauthorized: false,
  //      url: 'https://127.0.0.1:8080',
  //      headers: {'x-auth-token':'66LOHAiB8Zeod1bAeLYW'}
  //    });
  //
  //    rawClient.get('/events/stream/demo1', function(err, req){
  //
  //      req.on('result', function(err, res) {
  //        assert.ifError(err);
  //
  //        res.on('data', function(chunk) {
  //          var obj = JSON.parse(chunk.toString());
  //          assert.equal(obj.length, 1);
  //          assert.equal(obj[0].$payload, 'demo1 debug message');
  //
  //          //cleanup
  //          client.del('/tasks/demo1', function(err, req, res, obj) {
  //            assert.equal(null, err);
  //            assert.notEqual(null, obj);
  //            assert.equal('delete accepted', obj.message);
  //            done();
  //          });
  //
  //        });
  //
  //      });
  //
  //    });
  //
  //
  //    client.post('/tasks/demo1', null, function(err, req, res, obj) {
  //      assert.equal(null, err);
  //      assert.notEqual(null, obj);
  //      assert.equal('created', obj.message);
  //
  //      client.get('/tasks/demo1', function(err, req, res, obj){
  //        assert.equal(null, err);
  //        assert.notEqual(null, obj);
  //        assert.notEqual('', obj.name);
  //
  //        obj.taskScript = 'task.debug("demo1 debug message"); task.done(null,{});';
  //        client.put('/tasks/demo1', obj, function(err, req, res, obj){
  //          assert.equal(null, err);
  //          assert.notEqual(null, obj);
  //          assert.notEqual('', obj.taskScript);
  //          assert.equal('update accepted', obj.message);
  //
  //          client.get('/api/demo1', function(err, req, res){
  //            assert.equal(res.statusCode, 200);
  //          });
  //
  //        });
  //
  //      });
  //
  //    });
  //
  //  });
  //
  //});

});