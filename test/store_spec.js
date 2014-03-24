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

// var assert = require('assert')
//     ,storage;
 
// before(function(done) {
//     storage = require("../index").init({
//       dbPath:"./testdb",
//       rightsPath:"./rights.json",
//       tasksPath:"./tasks",
//       backupPath:"./backups"
//     });
//     storage.create("ademo", "1", {test: "ademo 1 test"});
//     storage.create("bdemoa", "1", {test: "bdemoa 1 test"});
//     storage.create("bdemob", "1", {test: "bdemob 1 test"});
//     storage.create("bdemob", "2", {test: "bdemob 2 test"});
//     storage.create("bdemob", "3", {test: "bdemob 3 test", test2: "bdemob 3 test2"});
//     storage.create("bdemob", "4", {test: "bdemob 4 test"});
//     storage.create("bdemob", "5", {test: "bdemob 5 test"});
//     storage.create("bdemob", "6", {test: "bdemob 6 test"});
//     storage.create("bdemoc", "1", {test: "bdemoc 1 test"});
//     storage.create("cdemoc", "1", {test: "cdemoc 1 test"});
//     storage.create("rangequery", "1!a", {test: "bdemob 1!a test"});
//     storage.create("rangequery", "1!b", {test: "bdemob 1!b test"});
//     storage.create("rangequery", "1!c", {test: "bdemob 1!c test"});
//     storage.create("rangequery", "2!a", {test: "bdemob 2!a test"});
//     storage.create("rangequery", "2!b", {test: "bdemob 2!b test"});
//     storage.create("rangequery", "2!b!1", {test: "bdemob 2!b!1 test"});
//     storage.create("rangequery", "2!b!2", {test: "bdemob 2!b!2 test"});
//     storage.create("rangequery", "2!b!3", {test: "bdemob 2!b!3 test"});
//     storage.create("rangequery", "2!c", {test: "bdemob 2!c test"});
//     storage.create("rangequery", "3!a", {test: "bdemob 3!a test"});
//     storage.create("rangequery", "3!b", {test: "bdemob 3!b test"});
//     storage.create("rangequery", "3!c", {test: "bdemob 3!c test"});

//     storage.create("deleteDemo", "1", {test: "delete demo 1 test"});
//     storage.create("deleteDemo", "2", {test: "delete demo 2 test"});
//     storage.create("deleteDemo", "3", {test: "delete demo 3 test"});
//     storage.create("deleteDemo", "4", {test: "delete demo 4 test"});

//     setTimeout(done, 1000);
// });

// after(function(done){
//     storage.destroy(console.log);
//     done();
// });

// describe('service: storage', function(){
//   describe('query', function(){
//     it('by store name begins with "bdemo" should return 8 items', function(done){
//       storage.read("bdemo", {}, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.length, 8);
//         done();
//       });
//     }),
//     it('by more specific store name "bdemob" should return only 6 items', function(done){
//       storage.read("bdemob", {}, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.length, 6);
//         assert.equal(data[0].key, "1");
//         done();
//       });
//     }),
//     it('by more specific store name "rangequery" from key "3!" should return 3 items', function(done){
//       storage.read("rangequery", {from: "3!"}, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.length, 3);
//         assert.equal(data[0].key, "3!a");
//         done();
//       });
//     }),
//     it('by more specific store name "rangequery" from key "3!b" should return 1 item', function(done){
//       storage.read("rangequery", {from: "3!b"}, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.length, 1);
//         assert.equal(data[0].key, "3!b");
//         done();
//       });
//     }),
//     it('by more specific store name "rangequery" from key "2!" should return 6 item', function(done){
//       storage.read("rangequery", {from: "2!"}, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.length, 6);
//         assert.equal(data[0].key, "2!a");
//         done();
//       });
//     }),
//     it('by more specific store name "rangequery" from key "2!b" should return 4 item', function(done){
//       storage.read("rangequery", {from: "2!b"}, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.length, 4);
//         assert.equal(data[0].key, "2!b");
//         done();
//       });
//     }),
//     it('by more specific store name "rangequery" from key "2!b" with limit 2 should return 2 item', function(done){
//       storage.read("rangequery", {from: "2!b", limit:2}, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.length, 2);
//         assert.equal(data[0].key, "2!b");
//         done();
//       });
//     }),
//     it('by more specific store name "rangequery" from key "2!b!2" should return 1 item', function(done){
//       storage.read("rangequery", {from: "2!b!2"}, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.length, 1);
//         assert.equal(data[0].key, "2!b!2");
//         done();
//       });
//     }),
//     it('by not matching store name should return an empty array', function(done){
//       storage.read("nomatch", {}, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.length, 0);
//         done();
//       });
//     }),
//     it('by store key should return a single item', function(done){
//       storage.read("bdemoa", { key: "1" }, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.test, "bdemoa 1 test");
//         done();
//       });
//     }),
//     it('by store name begins with "bdemo" and limit 3 should return 3 items', function(done){
//       storage.read("bdemo", { limit: 3 }, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.length, 3);
//         done();
//       });
//     }),
//     it('by store from key 3 with limit 3 should return 3 items', function(done){
//       storage.read("bdemob", { from: "3", limit:3 }, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data[0].key, "3");
//         assert.equal(data[2].key, "5");
//         assert.equal(data.length, 3);
//         done();
//       });
//     });
//     it('by store from key 3 with limit 3 with cache should return 3 items', function(done){
//       storage.read("bdemob", { from: "3", limit: 3 , cache: true }, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data[0].key, "3");
//         assert.equal(data[2].key, "5");
//         assert.equal(data.length, 3);
//         done();
//       });
//     });
//     it('by store with keysOnly should return 3 keys', function(done){
//       storage.read("bdemo", { keysOnly: true }, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data[0].value, undefined);
//         assert.equal(data.length, 8);
//         done();
//       });
//     });
//     it('by store from key 3 with limit 3 with keysOnly should return 3 keys', function(done){
//       storage.read("bdemob", { from: "3", limit: 3 , keysOnly: true }, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data[0].value, undefined);
//         assert.equal(data[0].key, "3");
//         assert.equal(data.length, 3);
//         done();
//       });
//     });
//     it('by store from literal query should return element', function(done){
//       storage.query("bdemob", { }, { 'value.test': /bdemob/i }, function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.length, 6);
//         assert.equal(data[0].key, "1");
//         done();
//       });
//     });
//   }),
//   describe('stores', function(){
//     it('should return 7 stores', function(done){
//       storage.stores(function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.length, 7);
//         done();
//       });
//     });
//   }),
//   describe('write changes', function(){
//     it('create should add a item', function(done){
//       storage.create("change_test_item", "1", {test: "change_test_item 1 test"}, function(error){
//         assert.equal(error, undefined);

//         storage.read("change_test_item", { key: "1" }, function(error, data){
//           assert.equal(data.test , "change_test_item 1 test");
//           done();  
//         });

//       });
//     }),
//     it('update should change the item', function(done){
//       storage.update("change_test_item", "1", {test: "new change_test_item 1 test"}, function(error){
//         assert.equal(error, undefined);

//         storage.read("change_test_item", { key: "1" }, function(error, data){
//           assert.equal(data.test , "new change_test_item 1 test");
//           done();  
//         });

//       });
//     }),
//     it('delete should remove the item', function(done){
//       storage.del("change_test_item", "1", function(error){
//         assert.equal(error, undefined);

//         storage.read("change_test_item", { key: "1" }, function(error, data){
//           assert.equal(data, undefined);
//           done();  
//         });

//       });
//     }),
//     it('delete item key 2 should remove a item', function(done){
//       storage.del("deleteDemo", "2", function(error){
//         assert.equal(error, undefined);

//         storage.read("deleteDemo", {}, function(error, data){
//           assert.equal(data.length, 3);
//           done();  
//         });

//       });
//     }),
//     it('delete should remove all items from a store', function(done){
//       storage.del("deleteDemo", null, function(){
//         storage.read("deleteDemo", {}, function(error, data){
//           assert.equal(error, undefined);
//           done();  
//         });

//       });
//     });
//   }),
//   describe('public/private stores', function(){
//     it('set public should return all public stores', function(done){
//       storage.setPublic("ademo", function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.grant, true);
//         assert.equal(data.name, "ademo");

//         var actualRights = storage.getRights().public;
//         assert.equal(actualRights.length, 1);
//         assert.equal(actualRights[0], "ademo");
        
//         done();
//       })
//     }),
//     it('set private should return only the public stores', function(done){
//       storage.setPrivate("ademo", function(error, data){
//         assert.equal(error, undefined);
//         assert.equal(data.grant, false);
//         assert.equal(data.name, "ademo");

//         var actualRights = storage.getRights().public;
//         assert.equal(actualRights.length, 0);

//         done();
//       });
//     }),
//     it('a name that not found should return error message', function(done){
//       storage.setPrivate("notmatch", function(error, data){
//         assert.notEqual(error, undefined);
//         assert.equal(error.message, "store not found");
//         done();
//       });
//     });
//   });
//   describe('import/export', function(){
//     it('should import data to import1', function(done){
//       var data = [
//         { key: 'name', value: 'Yuri Irsenovich Kim' }
//         , { key: 'dob', value: '16 February 1941' }
//         , { key: 'spouse', value: 'Kim Young-sook' }
//         , { key: 'occupation', value: 'Clown' }
//         ];
//       storage.imports("import1", data, function(error){
//         assert.equal(error, undefined);
//         storage.read("import1", {}, function(error, data){
//           assert.notEqual(data, undefined);
//           assert.equal(data.length, 4);
//           assert.equal(data[0].store, "import1");
//           done();
//         });
//       })
//     }),
//     it('should import raw data', function(done){
//       var data = [
//         { key: 'import2!name', value: 'Yuri Irsenovich Kim' }
//         , { key: 'import2!dob', value: '16 February 1941' }
//         , { key: 'import2!spouse', value: 'Kim Young-sook' }
//         , { key: 'import2!occupation', value: 'Clown' }
//         ];
//       storage.imports("", data, function(error){
//         assert.equal(error, undefined);
//         storage.read("import2", {}, function(error, data){
//           assert.notEqual(data, undefined);
//           assert.equal(data.length, 4);
//           assert.equal(data[0].store, "import2");
//           done();
//         });
//       })
//     }),
//     it('should export import1 data', function(done){
//       storage.exports("import1", function(error, data){
//         assert.equal(error, undefined);
//         assert.notEqual(data, undefined);
//         assert.equal(data.length, 4);
//         assert.equal(data[0].key, "dob");
//         done();
//       });
//     }),
//     it('should export all data', function(done){
//       storage.exports("", function(error, data){
//         assert.equal(error, undefined);
//         assert.notEqual(data, undefined);
//         assert.equal(data.length, 30);
//         assert.equal(data[17].key, "spouse");
//         done();
//       })
//     });
//   });
//   describe('backup/restore', function(){
//     it('should backup/restore the complete DB to path', function(done){
//       storage.backup(function(error, data){
//         assert.equal(error, undefined);
//         assert.notEqual(data, undefined);
//         storage.restore(data, function(error){
//           assert.equal(error, undefined);
//           done();
//         });
//       });
//     });
//   });
//   describe('statistics', function(){
//     it('should get the current db size', function(done){
//       storage.statistics(function(error, data){
//           done();
//       });
//     });
//   });
//   describe('tasks', function(){
//     it('should run a task in folder and success',function(done){
//       storage.run("success", {}, function(error, data){
//         assert.equal(error, undefined);
//         assert.notEqual(data, undefined);
//         assert.equal(data.message, "test success");
//         done();
//       });
//     }),
//     it('should run a task in folder and failure',function(done){
//       storage.run("failure", {}, function(error, data){
//         assert.notEqual(error, undefined);
//         assert.equal(data, undefined);
//         assert.equal(error.message, "test failure");
//         done();
//       });
//     }),
//     it('should run a task in folder and error',function(done){
//       storage.run("error", {}, function(error, data){
//         assert.notEqual(error, undefined);
//         assert.equal(data, undefined);
//         assert.throws(error, Error);
//         done();
//       });
//     }),
//     it('should run the "schema" task with parameters and storage context',function(done){
//       storage.run("schema", { store: "bdemob" }, function(error, data){
//         assert.equal(error, undefined);
//         assert.notEqual(data, undefined);
//         assert.equal(data.test, "");
//         assert.equal(data.test2, "");
//         done();
//       });
//     }),
//     it('should run the "move" task to move items from store -> to store',function(done){
      
//       storage.run("move", { from: "bdemoc", to: "bdemocTmp" }, function(error, data){
//         assert.equal(error, undefined);
//         assert.notEqual(data, undefined);

//         storage.read("bdemoc!", {}, function(error, data){
//           assert.equal(error, undefined);
//           assert.notEqual(data, undefined);
//           assert.equal(data.length, 0);
//           storage.read("bdemocTmp!", {}, function(error, data){
//             assert.equal(error, undefined);
//             assert.notEqual(data, undefined);
//             assert.equal(data.length, 1);
//             done();
//           });
//         });
//       });
//     }),
//     it('should create a task, change code and run',function(done){
//       var ctx = {count:0};
//       var task = storage.task("first", ctx, function(error, data){
//         assert.equal(error, undefined);
//         assert.notEqual(data, undefined);
//         assert.equal(data.count, 1);
//       });
//       task();
//       task = storage.task("second", ctx, function(error, data){
//         assert.equal(error, undefined);
//         assert.notEqual(data, undefined);
//         assert.equal(data.count, 3);
//         done();
//       });
//       task();
//     }),
//     it('should run the "expand" task to execute "demoFunction" function from context',function(done){
//       var ctx = storage.run("expand", { }, function(error, data){
//         assert.equal(error, undefined);
//         assert.notEqual(data, undefined);
//       });
//       var data = ctx.demoFunction("demo");
//       assert.notEqual(data, undefined);
//       assert.equal(data, "demo new");
//       done();
//     });
//   });
//   describe('notifications', function(){
//     it('on change should push changed data', function(done){
//       storage.onChange(function(changed){
//         assert.equal(changed.key, "notifications!first");
//       });
//       storage.create("notifications", "first", {test: "notifications test 1"}, function(error){
//         storage.del("notifications", "first", function(error){
//         });
//       });
//       var ops = [
//         { type: 'put', key: 'notifications!first', value: 'notifications test 2' }
//         , { type: 'put', key: 'notifications!first', value: 'notifications test 3' }
//         , { type: 'del', key: 'notifications!first' }
//       ];
//       storage.batch(ops, function(error){
//         done();
//       });
//     })
//   });
// });