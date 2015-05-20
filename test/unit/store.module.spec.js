'use strict';

var assert = require('assert');
var sut;

describe('Module: JSON Key/Value Storage', function(){
  before(function(done) {
    var logger = require('../../lib/logger.module.js').init();
    sut = require('../../lib/store.module.js').init({
      dbPath:'./storespecdb',
      backupPath:'./backups'
    }, logger);
    sut.update('ademo', '1', {test: 'ademo 1 test', group: 'B'});
    sut.update('bdemoa', '1', {test: 'bdemoa 1 test'});
    sut.update('bdemob', '1', {test: 'bdemob 1 test', group: 'A'});
    sut.update('bdemob', '2', {test: 'bdemob 2 test', demo22: { group: 'Z'}});
    sut.update('bdemob', '3', {test: 'bdemob 3 test', test2: 'bdemob 3 test2', group: 'C'});
    sut.update('bdemob', '4', {test: 'bdemob 4 test'});
    sut.update('bdemob', '5', {test: 'bdemob 5 test', group: 'B', demo22: { group: 'Z'}});
    sut.update('bdemob', '6', {test: 'bdemob 6 test', group: ['A','B','X']});
    sut.update('bdemoc', '1', {test: 'bdemoc 1 test'});
    sut.update('cdemoc', '1', {test: 'cdemoc 1 test', group: 'A'});
    sut.update('rangequery', '1!a', {test: 'bdemob 1!a test'});
    sut.update('rangequery', '1!b', {test: 'bdemob 1!b test'});
    sut.update('rangequery', '1!c', {test: 'bdemob 1!c test'});
    sut.update('rangequery', '2!a', {test: 'bdemob 2!a test'});
    sut.update('rangequery', '2!b', {test: 'bdemob 2!b test'});
    sut.update('rangequery', '2!b!1', {test: 'bdemob 2!b!1 test'});
    sut.update('rangequery', '2!b!2', {test: 'bdemob 2!b!2 test'});
    sut.update('rangequery', '2!b!3', {test: 'bdemob 2!b!3 test'});
    sut.update('rangequery', '2!c', {test: 'bdemob 2!c test'});
    sut.update('rangequery', '3!a', {test: 'bdemob 3!a test'});
    sut.update('rangequery', '3!b', {test: 'bdemob 3!b test'});
    sut.update('rangequery', '3!c', {test: 'bdemob 3!c test'});

    sut.update('deleteDemo', '1', {test: 'delete demo 1 test'});
    sut.update('deleteDemo', '2', {test: 'delete demo 2 test'});
    sut.update('deleteDemo', '3', {test: 'delete demo 3 test'});
    sut.update('deleteDemo', '4', {test: 'delete demo 4 test'});

    setTimeout(done,1000);
  });
  after(function(done){
    setTimeout(function(){
      sut.destroy(done);
    },1000);
  });
  
  describe('query', function(){
    it('by store name begins with "bdemo" should return 8 items', function(done){
      sut.query('bdemo', {}, {}, function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 8);
        done();
      });
    }),
    it('by more specific store name "bdemob" should return only 6 items', function(done){
      sut.query('bdemob', {}, {}, function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 6);
        assert.equal(data.results[0].$key, '1');
        done();
      });
    }),
    it('by more specific store name "rangequery" from key "3" should return 3 items', function(done){
      sut.query('rangequery', {from: '3'}, {}, function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 3);
        assert.equal(data.results[0].$key, '3!a');
        done();
      });
    }),
    it('by more specific store name "rangequery" from key "3!b" should return 1 item', function(done){
      sut.query('rangequery', {from: '3!b'}, {}, function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 1);
        assert.equal(data.results[0].$key, '3!b');
        done();
      });
    }),
    it('by more specific store name "rangequery" from key "2!" should return 6 item', function(done){
      sut.query('rangequery', {from: '2'}, {}, function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 6);
        assert.equal(data.results[0].$key, '2!a');
        done();
      });
    }),
    it('by more specific store name "rangequery" from key "2!b" should return 4 items', function(done){
      sut.query('rangequery', {from: '2!b'}, {}, function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 4);
        assert.equal(data.results[0].$key, '2!b');
        done();
      });
    }),
    it('by more specific store name "rangequery" from key "2!b" with limit 2 should return 2 item', function(done){
      sut.query('rangequery', {from: '2!b', limit:2}, {}, function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 2);
        assert.equal(data.results[0].$key, '2!b');
        done();
      });
    }),
    it('by more specific store name "rangequery" from key "2!b!2" should return 1 item', function(done){
      sut.query('rangequery', {from: '2!b!2'}, {}, function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 1);
        assert.equal(data.results[0].$key, '2!b!2');
        done();
      });
    }),
    it('by not matching store name should return an empty array', function(done){
      sut.query('nomatch', {}, {}, function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 0);
        done();
      });
    }),
    it('by store key should return a single item', function(done){
      sut.query('bdemoa', { key: '1' },{}, function(error, data){
        assert.ifError(error);
        assert.equal(data.$payload.test, 'bdemoa 1 test');
        done();
      });
    }),
    it('by store name begins with "bdemo" and limit 4 should return 4 items', function(done){
      sut.query('bdemo', { limit: 4 }, {}, function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 4);
        done();
      });
    }),
    it('by store with keysOnly should return 3 keys', function(done){
      sut.query('bdemo', { keysOnly: true }, {}, function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 8);
        assert.equal(data.results[0].$payload, undefined);
        done();
      });
    });
    it('by store from literal query should return element', function(done){
      sut.query('bdemob', { }, { 'test': /bdemob/i }, function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 6);
        assert.equal(data.results[0].$key, '1');
        done();
      });
    });
  });
  describe('stores', function(){
    it('should return 7 stores', function(done){
      sut.stores(function(error, data){
        assert.ifError(error);
        assert.equal(data.results.length, 7);
        done();
      });
    });
  });
  describe('write changes', function(){
    it('create should add a item', function(done){
      sut.insert('change_test_item', '1', {test: 'change_test_item 1 test'}, function(error){
        assert.ifError(error);

        sut.query('change_test_item', { key: '1' }, {}, function(error, data){
          assert.ifError(error);
          assert.equal(data.$payload.test , 'change_test_item 1 test');
          assert.notEqual(data.$version, null);
          done();  
        });

      });
    }),
    it('update should change the item', function(done){
      sut.update('change_test_item', '1', {test: 'new change_test_item 1 test'}, function(error){
        assert.ifError(error);

        sut.query('change_test_item', { key: '1' }, {}, function(error, data){
          assert.ifError(error);
          assert.equal(data.$payload.test , 'new change_test_item 1 test');
          assert.notEqual(data.$version, null);
          done();  
        });

      });
    }),
    it('delete should remove the item', function(done){
      sut.del('change_test_item', '1', function(error){
        assert.ifError(error);

        sut.query('change_test_item', { key: '1' }, {}, function(error, data){
          assert.equal(data, undefined);
          done();  
        });

      });
    }),
    it('delete item key 2 should remove a item', function(done){
      sut.del('deleteDemo', '2', function(error){
        assert.ifError(error);

        sut.query('deleteDemo', {}, {}, function(error, data){
          assert.equal(data.results.length, 3);
          done();  
        });

      });
    }),
    it('delete should remove all items from a store', function(done){
      sut.del('deleteDemo', null, function(){
        sut.query('deleteDemo', {}, {}, function(error, data){
          assert.ifError(error);
          assert.equal(data.results.length, 0);
          done();  
        });

      });
    });
  });
  describe('conditional write changes', function(){
    it('create should add a item', function(done){
      sut.insert('try_change_test_item', '1', {test: 'try_change_test_item 1 test'}, function(error){
        assert.ifError(error);

        sut.query('try_change_test_item', { key: '1' }, {}, function(error, data){
          assert.ifError(error);
          assert.equal(data.$payload.test , 'try_change_test_item 1 test');
          assert.notEqual(data.$version, null);
          done();  
        });

      });
    });

    it('update with same version should change the item', function(done){

      sut.query('try_change_test_item', { key: '1' }, {}, function(error, data){
        var oldVersion = data.$version;
        data.$payload.test = 'new try_change_test_item 1 test';

        sut.tryUpdate('try_change_test_item', '1', oldVersion, data.$payload, function(error){
          assert.ifError(error);

          sut.query('try_change_test_item', { key: '1' }, {}, function(error, afterChange){
            assert.ifError(error);
            assert.equal(afterChange.$payload.test , 'new try_change_test_item 1 test');
            assert.equal(oldVersion < afterChange.$version, true);
            assert.notEqual(afterChange.$version, null);
            done();  
          });

        });

      });
    });

    it('update with the newer version number should change to item', function(done){

      sut.query('try_change_test_item', { key: '1' }, {}, function(error, data){
        var oldVersion = data.$version;
        data.$payload.test = 'new try_change_test_item 1 test';

        sut.tryUpdate('try_change_test_item', '1', oldVersion+1, data.$payload, function(error){
          assert.ifError(error);

          sut.query('try_change_test_item', { key: '1' }, {}, function(error, afterChange){
            assert.ifError(error);
            assert.equal(afterChange.$payload.test , 'new try_change_test_item 1 test');
            assert.equal(oldVersion < afterChange.$version, true);
            assert.notEqual(afterChange.$version, null);
            done();  
          });

        });

      });
    });

    it('update with the older version number should throw an error', function(done){

      sut.query('try_change_test_item', { key: '1' }, {}, function(error, data){
        var oldVersion = data.$version;
        data.$payload.test = 'new try_change_test_item 1 test';

        sut.tryUpdate('try_change_test_item', '1', oldVersion-1, data.$payload, function(error){
          assert.equal(error.message, 'Version conflict');
          done();
        });

      });
    }); 

    it('delete with the older version number should throw an error', function(done){

      sut.query('try_change_test_item', { key: '1' }, {}, function(error, data){
        var oldVersion = data.$version;

        sut.tryDel('try_change_test_item', '1', oldVersion-1, function(error){
          assert.equal(error.message, 'Version conflict');
          done();
        });

      });
    }); 

    it('delete with same version should remove the item', function(done){

      sut.query('try_change_test_item', { key: '1' }, {}, function(error, data){
        var oldVersion = data.$version;

        sut.tryDel('try_change_test_item', '1', oldVersion, function(error){
          assert.ifError(error);

          sut.query('try_change_test_item', { key: '1' }, {}, function(error){
            assert.equal(error.message, 'Key not found in database [try_change_test_item!1]');
            done();  
          });

        });

      });
    });

  });
  describe('grouping', function(){
    it('by range store name "bdemo" with groupBy', function(done){
      sut.query('bdemo', { groupBy: 'group' }, { }, function(error, data){
        assert.ifError(error);
        assert.equal(data.undefined.length, 4);
        assert.equal(data.A.length, 2);
        assert.equal(data.B.length, 2);
        assert.equal(data.C.length, 1);
        assert.equal(data.X.length, 1);
        done();
      });
    }),
    it('by specific store "cdemoc" name with groupBy', function(done){
      sut.query('cdemoc', { groupBy: 'group' }, { }, function(error, data){
        assert.ifError(error);
        assert.equal(data.A.length, 1);
        done();
      });
    }),
    it('by specific store "bdemob" name with groupBy', function(done){
      sut.query('bdemob', { groupBy: 'demo22.group' }, { }, function(error, data){
        assert.ifError(error);
        assert.equal(data.undefined.length, 4);
        assert.equal(data.Z.length, 2);
        done();
      });
    });
  });
  describe('import/export', function(){
    it('should import data to import1', function(done){
      var data = [
        { key: 'name', value: 'Max Mustermann' },
        { key: 'dob', value: '16 February 1941' },
        { key: 'spouse', value: 'Maxi' },
        { key: 'occupation', value: 'Clown' }
        ];
      sut.imports('import1', data, function(error){
        assert.ifError(error);
        sut.query('import1', {}, {}, function(error, data){
          assert.notEqual(data, undefined);
          assert.equal(data.results.length, 4);
          assert.equal(data.results[0].$store, 'import1');
          done();
        });
      });
    }),
    it('should import raw data', function(done){
      var data = [
        { key: 'name', value: 'Max Mustermann', store: 'import2' },
        { key: 'dob', value: '16 February 1941', store: 'import2' },
        { key: 'spouse', value: 'Maxi', store: 'import2' },
        { key: 'occupation', value: 'Clown', store: 'import2' }
        ];
      sut.imports('', data, function(error){
        assert.ifError(error);
        sut.query('import2', {}, {}, function(error, data){
          assert.notEqual(data, undefined);
          assert.equal(data.results.length, 4);
          assert.equal(data.results[0].$store, 'import2');
          done();
        });
      });
    }),
    it('should export import1 data', function(done){
      sut.exports('import1', function(error, data){
        assert.ifError(error);
        assert.notEqual(data, undefined);
        assert.equal(data.length, 4);
        assert.equal(data[0].key, 'dob');
        done();
      });
    }),
    it('should export all data', function(done){
      sut.exports('', function(error, data){
        assert.ifError(error);
        assert.notEqual(data, undefined);
        assert.equal(data.length, 30);
        assert.equal(data[17].key, 'spouse');
        done();
      });
    });
  });
  describe('backup/restore', function(){
    it('should backup/restore the complete DB to path', function(done){
      sut.backup(function(error, backupFileName){
        assert.ifError(error);
        assert.notEqual(backupFileName, undefined);

        sut.listBackups(function(error, data){
          assert.ifError(error);
          assert.equal(data.length > 0, true);

          sut.restore(backupFileName, function(error){
            assert.ifError(error);
            done();
          });

        });
      });
    });
  });
  describe('statistics', function(){
    it('should get the current db size', function(done){
      sut.statistics(function(error, data){
          assert.ifError(error);
          assert.notEqual(data, undefined);
          done();
      });
    });
  });
  describe('notifications', function(){
    it('on change should push changed data', function(done){
      sut.onChange(function(changed){
        assert.equal(changed.key, 'notifications!first');
      });
      sut.insert('notifications', 'first', {test: 'notifications test 1'}, function(error){
        assert.ifError(error);
        sut.del('notifications', 'first', function(error){
          assert.ifError(error);
        });
      });
      var ops = [
        { type: 'put', key: 'notifications!first', value: 'notifications test 2' },
        { type: 'put', key: 'notifications!first', value: 'notifications test 3' },
        { type: 'del', key: 'notifications!first' }
      ];
      sut.batch(ops, function(error){
        assert.ifError(error);
        done();
      });
    });
  });
});
