var assert = require('assert'),
    restify = require('restify');

var client = restify.createJsonClient({
  version: '*',
  url: 'http://127.0.0.1:8080',
  headers: {"api_key":"6654edc5-82a3-4006-967f-97d5817d7fe2"}
});

before(function(done) {
    require('../server');
    done();
});

after(function(done){
  done();
});

describe('service: store', function(){
  describe('on ...', function(){
    before(function(done){
      done();
    });
    after(function(done){
      done();
    }),
    it('should be ...', function(done){
      done();
    });
  });
});


// var assert = require('assert'),
//     restify = require('restify');

// var client = restify.createJsonClient({
//   version: '*',
//   url: 'http://127.0.0.1:8080',
//   headers: {"api_key":"6654edc5-82a3-4006-967f-97d5817d7fe2"}
// });

// before(function(done) {
//     require('../server');
//     done();
// });

// after(function(done){
//   client.basicAuth("subkit","subkit");
//   client.del("/manage/destroy", function(err, req, res, data){
//     done();
//   });
// });

// describe('service: storage', function(){
//   describe('on grant access', function(){
//     before(function(done){
//       client.post("/stores/grant_test/1",{ test: "my grant demo item 1"}, function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//       });
//       client.get("/stores", function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 200);

//         data.forEach(function(item){
//           assert.equal(item.grant, false);
//         });
//         done();
//       });
//     });
//     after(function(done){
//       client.del("/stores/grant_test/1", function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 202);
//         done();
//       });
//     }),
//     it('should grant access to a store', function(done){
//       client.basicAuth("subkit","subkit");
//       client.post('/stores/grant_test/grant', function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//         assert.equal(data.grant, true);
//         done();
//       });
//     }),
//     it('should revoke access to a store', function(done){
//       client.basicAuth("subkit","subkit");
//       client.del('/stores/grant_test/grant', function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 202);
//         assert.equal(data.grant, false);
//         done();
//       });
//     });
//   }),
//   describe('on login', function(){
//     it('should be response current app settings when right credentials', function(done){
//         client.basicAuth("subkit","subkit");
//         client.post('/manage/login', function(err, req, res, data) {
//             assert.equal(err, undefined);
//             assert.equal(res.statusCode, 200);
//             assert.equal(data.api.apiKey, "6654edc5-82a3-4006-967f-97d5817d7fe2");
//             assert.equal(data.app.type, "lite");
//             done();
//         });
//     }),
//     it('should be failed when wrong credentials', function(done){
//         client.basicAuth("wrong","wrong");
//         client.post('/manage/login', function(err, req, res, data) {
//             assert.notEqual(err, undefined);
//             assert.equal(res.statusCode, 401);
//             done();
//         });
//     });
//   }),
//   describe('on read', function(){
//     before(function(done){
//       client.post("/stores/ademo/1",{ test: "my ademo item 1"}, function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//       });
//       client.post("/stores/bdemoa/1",{ test: "my bdemoa item 1"}, function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//       });
//       client.post("/stores/bdemob/1",{ test: "my bdemob item 1"}, function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//       });
//       client.post("/stores/bdemoc/1",{ test: "my bdemoc item 1"}, function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//       });
//       client.post("/stores/bdemoc/2",{ test: "my bdemoc item 2"}, function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//       });
//       client.post("/stores/bdemoc/3",{ test: "my bdemoc item 3"}, function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//       });
//       client.post("/stores/bdemoc/4",{ test: "my bdemoc item 4"}, function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//       });
//       client.post("/stores/bdemod/1",{ test: "my bdemod item 1"}, function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//       });
//       client.post("/stores/cdemo/1",{ test: "my cdemo item 1"}, function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//         done();
//       });
//     }),
//     it('should return all available feed names', function(done){
//         client.get('/stores', function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.equal(res.statusCode, 200);
//           assert.equal(data.length, 7);

//           done();
//         });
//     }),
//     it('name and key should return a single item', function(done){
//         client.get('/stores/ademo/1', function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.equal(res.statusCode, 200);

//           assert.equal(data.test, "my ademo item 1");

//           done();
//         });
//     }),
//     it('name "bde" match should return 7 items', function(done){
//         client.get('/stores/bde', function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.equal(res.statusCode, 200);

//           assert.equal(data.length, 7);

//           done();
//         });
//     }),
//     it('name "bdemoc" match should return 4 items', function(done){
//         client.get('/stores/bdemoc', function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.equal(res.statusCode, 200);

//           assert.equal(data.length, 4);

//           done();
//         });
//     }),
//     it('name "nomatch" match should return 0 items', function(done){
//         client.get('/stores/nomatch', function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.equal(res.statusCode, 200);

//           assert.equal(data.length, 0);

//           done();
//         });
//     }),
//     it('name "bde" match with limit 2 should return 2 items', function(done){
//         client.get('/stores/bde?limit=2', function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.equal(res.statusCode, 200);

//           assert.equal(data.length, 2);

//           done();
//         });
//     }),
//     it('name "bdemoc" match with key from "2" and limit 2 should return 2 items ["2","3"]', function(done){
//         client.get('/stores/bdemoc?from=2&limit=2', function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.equal(res.statusCode, 200);

//           assert.equal(data.length, 2);
//           assert.equal(data[0].key, "2");
//           assert.equal(data[1].key, "3");

//           done();
//         });
//     }),
//     it('name "bdemo" match with keysOnly should return 7 items', function(done){
//         client.get('/stores/bdemo?keysOnly=true', function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.equal(res.statusCode, 200);

//           assert.equal(data[0].value, undefined);
//           assert.equal(data.length, 7);
//           done();
//         });
//     }),
//     it('name "bdemo" match with key from "2", limit 2 and keysOnly should return 2 items', function(done){
//         client.get('/stores/bdemoc?from=2&limit=2&keysOnly=true', function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.equal(res.statusCode, 200);
//           assert.equal(data[0].value, undefined);
//           assert.equal(data.length, 2);
//           done();
//         });
//     });
//   }),
//   describe('on plugins', function(){
//     it('should run the "schema" plugin per GET', function(done){
//       client.get('/job/schema?store=bdemob', function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.equal(res.statusCode, 200);
//           assert.equal(data.test, "");
//           done();
//         });
//     }),
//     it('should run the "schema" plugin per POST', function(done){
//       client.post('/job/schema', { store: "bdemob"}, function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.equal(res.statusCode, 200);
//           assert.equal(data.test, "");
//           done();
//         });
//     })
//     // it('should run the "error" plugin per POST', function(done){
//     //   client.post('/job/error', { log: "test" }, function(err, req, res, data) {
//     //       assert.equal(err, undefined);
//     //       assert.equal(res.statusCode, 200);
//     //       assert.equal(data.status, "created");
//     //       done();
//     //     });
//     // });
//   }),
//   describe('on import/export', function(){
//     it('should import values to "demoimport" store', function(done){
//       var data = [
//         { key: 'name', value: 'Yuri Irsenovich Kim' }
//         , { key: 'dob', value: '16 February 1941' }
//         , { key: 'spouse', value: 'Kim Young-sook' }
//         , { key: 'occupation', value: 'Clown' }
//       ];
//       client.basicAuth("subkit","subkit");
//       client.post('/manage/import/demoimport',data, function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//         client.get('/stores/demoimport',function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.notEqual(data, undefined);
//           assert.equal(res.statusCode, 200);
//           assert.equal(data.length, 4);
//           done();
//         });
//       });
//     }),
//     it('should import values to specified stores', function(done){
//       var data = [
//         { key: 'demoimport2!name', value: 'Yuri Irsenovich Kim' }
//         , { key: 'demoimport1!dob', value: '16 February 1941' }
//         , { key: 'demoimport2!spouse', value: 'Kim Young-sook' }
//         , { key: 'demoimport2!occupation', value: 'Clown' }
//       ];
//       client.basicAuth("subkit","subkit");
//       client.post('/manage/import',data, function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 201);
//         client.get('/stores/demoimport1',function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.notEqual(data, undefined);
//           assert.equal(res.statusCode, 200);
//           assert.equal(data.length, 1);
//         });
//         client.get('/stores/demoimport2',function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.notEqual(data, undefined);
//           assert.equal(res.statusCode, 200);
//           assert.equal(data.length, 3);
//           done();
//         });
//       });
//     }),
//     it('should export values from "demoimport" store', function(done){
//       client.basicAuth("subkit","subkit");
//       client.get('/manage/export/demoimport', function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 200);
//         assert.equal(data.length, 4);
//         done();
//       });
//     }),
//     it('should export values from all stores', function(done){
//       client.basicAuth("subkit","subkit");
//       client.get('/manage/export', function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.equal(res.statusCode, 200);
//         assert.equal(data.length, 36);
//         done();
//       });
//     });
//   }),
//   describe('on backup/restore', function(){
//     it('should backup and restore to folder', function(done){
//       client.basicAuth("subkit","subkit");
      
//       client.post('/manage/backup', function(err, req, res, data) {
//         assert.equal(err, undefined);
//         assert.notEqual(data, undefined);
//         assert.equal(res.statusCode, 202);
        
//         client.post("/stores/importdemo/100",{test: ""}, function(err, req, res, data) {
//           assert.equal(err, undefined);
//           assert.equal(res.statusCode, 201);
       
//           client.post('/manage/restore', { name:'spec'}, function(err, req, res, data) {
//             assert.equal(err, undefined);
//             assert.notEqual(data, undefined);
//             assert.equal(res.statusCode, 202);
//             client.get("/stores/importdemo/100",function(err, req, res, data) {
//               assert.notEqual(err, undefined);
//               done();      
//             });
//           });

//         });
//       });
//     });
//   });
// });

// // describe('service: messaging', function(){
// //   describe('on messaging', function(){
// //     it('should be ...', function(done){
// //     })
// //     ,it('should be more ...', function(done){
// //     });
// //   });
// // });

