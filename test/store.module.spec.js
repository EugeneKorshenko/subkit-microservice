'use strict';

var assert = require('assert'),
    sut;

describe('Module: JSON Key/Value Storage', function(){
  before(function(done) {
    sut = require('../lib/store.module.js').init({
      dbPath:'./storespecdb',
      rightsPath:'./rights.json',
      tasksPath:'./tasks',
      backupPath:'./backups'
    });
    sut.upsert('ademo', '1', {test: 'ademo 1 test', group: 'B'});
    sut.upsert('bdemoa', '1', {test: 'bdemoa 1 test'});
    sut.upsert('bdemob', '1', {test: 'bdemob 1 test', group: 'A'});
    sut.upsert('bdemob', '2', {test: 'bdemob 2 test'});
    sut.upsert('bdemob', '3', {test: 'bdemob 3 test', test2: 'bdemob 3 test2', group: 'C'});
    sut.upsert('bdemob', '4', {test: 'bdemob 4 test'});
    sut.upsert('bdemob', '5', {test: 'bdemob 5 test', group: 'B'});
    sut.upsert('bdemob', '6', {test: 'bdemob 6 test'});
    sut.upsert('bdemoc', '1', {test: 'bdemoc 1 test'});
    sut.upsert('cdemoc', '1', {test: 'cdemoc 1 test', group: 'A'});
    sut.upsert('rangequery', '1!a', {test: 'bdemob 1!a test'});
    sut.upsert('rangequery', '1!b', {test: 'bdemob 1!b test'});
    sut.upsert('rangequery', '1!c', {test: 'bdemob 1!c test'});
    sut.upsert('rangequery', '2!a', {test: 'bdemob 2!a test'});
    sut.upsert('rangequery', '2!b', {test: 'bdemob 2!b test'});
    sut.upsert('rangequery', '2!b!1', {test: 'bdemob 2!b!1 test'});
    sut.upsert('rangequery', '2!b!2', {test: 'bdemob 2!b!2 test'});
    sut.upsert('rangequery', '2!b!3', {test: 'bdemob 2!b!3 test'});
    sut.upsert('rangequery', '2!c', {test: 'bdemob 2!c test'});
    sut.upsert('rangequery', '3!a', {test: 'bdemob 3!a test'});
    sut.upsert('rangequery', '3!b', {test: 'bdemob 3!b test'});
    sut.upsert('rangequery', '3!c', {test: 'bdemob 3!c test'});

    sut.upsert('deleteDemo', '1', {test: 'delete demo 1 test'});
    sut.upsert('deleteDemo', '2', {test: 'delete demo 2 test'});
    sut.upsert('deleteDemo', '3', {test: 'delete demo 3 test'});
    sut.upsert('deleteDemo', '4', {test: 'delete demo 4 test'});

    done();
  });
  after(function(done){
    sut.destroy(done);
  });
  
  describe.skip('query', function(){
    it('by store name begins with "bdemo" should return 8 items', function(done){
      sut.read('bdemo', {}, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.length, 8);
        done();
      });
    }),
    it('by more specific store name "bdemob" should return only 6 items', function(done){
      sut.read('bdemob', {}, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.length, 6);
        assert.equal(data[0].key, '1');
        done();
      });
    }),
    it('by more specific store name "rangequery" from key "3!" should return 3 items', function(done){
      sut.read('rangequery', {from: '3!'}, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.length, 3);
        assert.equal(data[0].key, '3!a');
        done();
      });
    }),
    it('by more specific store name "rangequery" from key "3!b" should return 1 item', function(done){
      sut.read('rangequery', {from: '3!b'}, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.length, 1);
        assert.equal(data[0].key, '3!b');
        done();
      });
    }),
    it('by more specific store name "rangequery" from key "2!" should return 6 item', function(done){
      sut.read('rangequery', {from: '2!'}, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.length, 6);
        assert.equal(data[0].key, '2!a');
        done();
      });
    }),
    it('by more specific store name "rangequery" from key "2!b" should return 4 items', function(done){
      sut.read('rangequery', {from: '2!b'}, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.length, 4);
        assert.equal(data[0].key, '2!b');
        done();
      });
    }),
    it('by more specific store name "rangequery" from key "2!b" with limit 2 should return 2 item', function(done){
      sut.read('rangequery', {from: '2!b', limit:2}, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.length, 2);
        assert.equal(data[0].key, '2!b');
        done();
      });
    }),
    it('by more specific store name "rangequery" from key "2!b!2" should return 1 item', function(done){
      sut.read('rangequery', {from: '2!b!2'}, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.length, 1);
        assert.equal(data[0].key, '2!b!2');
        done();
      });
    }),
    it('by not matching store name should return an empty array', function(done){
      sut.read('nomatch', {}, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.length, 0);
        done();
      });
    }),
    it('by store key should return a single item', function(done){
      sut.read('bdemoa', { key: '1' }, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.test, 'bdemoa 1 test');
        done();
      });
    }),
    it('by store name begins with "bdemo" and limit 3 should return 3 items', function(done){
      sut.read('bdemo', { limit: 3 }, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.length, 3);
        done();
      });
    }),
    it('by store from key 3 with limit 3 should return 3 items', function(done){
      sut.read('bdemob', { from: '3', limit:3 }, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data[0].key, '3');
        assert.equal(data[2].key, '5');
        assert.equal(data.length, 3);
        done();
      });
    });
    it('by store from key 3 with limit 3 with cache should return 3 items', function(done){
      sut.read('bdemob', { from: '3', limit: 3 , cache: true }, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data[0].key, '3');
        assert.equal(data[2].key, '5');
        assert.equal(data.length, 3);
        done();
      });
    });
    it('by store with keysOnly should return 3 keys', function(done){
      sut.read('bdemo', { keysOnly: true }, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data[0].value, undefined);
        assert.equal(data.length, 8);
        done();
      });
    });
    it('by store from key 3 with limit 3 with keysOnly should return 3 keys', function(done){
      sut.read('bdemob', { from: '3', limit: 3 , keysOnly: true }, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data[0].value, undefined);
        assert.equal(data[0].key, '3');
        assert.equal(data.length, 3);
        done();
      });
    });
    it('by store from literal query should return element', function(done){
      sut.query('bdemob', { }, { 'value.test': /bdemob/i }, function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.length, 6);
        assert.equal(data[0].key, '1');
        done();
      });
    });
  });
  describe.skip('stores', function(){
    it('should return 7 stores', function(done){
      sut.stores(function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.length, 7);
        done();
      });
    });
  });
  describe.skip('write changes', function(){
    it('create should add a item', function(done){
      sut.upsert('change_test_item', '1', {test: 'change_test_item 1 test'}, function(error){
        assert.equal(error, undefined);

        sut.read('change_test_item', { key: '1' }, function(error, data){
          assert.equal(data.test , 'change_test_item 1 test');
          done();  
        });

      });
    }),
    it('update should change the item', function(done){
      sut.upsert('change_test_item', '1', {test: 'new change_test_item 1 test'}, function(error){
        assert.equal(error, undefined);

        sut.read('change_test_item', { key: '1' }, function(error, data){
          assert.equal(data.test , 'new change_test_item 1 test');
          done();  
        });

      });
    }),
    it('delete should remove the item', function(done){
      sut.del('change_test_item', '1', function(error){
        assert.equal(error, undefined);

        sut.read('change_test_item', { key: '1' }, function(error, data){
          assert.equal(data, undefined);
          done();  
        });

      });
    }),
    it('delete item key 2 should remove a item', function(done){
      sut.del('deleteDemo', '2', function(error){
        assert.equal(error, undefined);

        sut.read('deleteDemo', {}, function(error, data){
          assert.equal(data.length, 3);
          done();  
        });

      });
    }),
    it('delete should remove all items from a store', function(done){
      sut.del('deleteDemo', null, function(){
        sut.read('deleteDemo', {}, function(error, data){
          assert.equal(error, undefined);
          done();  
        });

      });
    });
  });
  describe('grouping', function(){
    it('by specific store name with group name "content"', function(done){
      sut.query('bdemo', { groupingKey: 'value.group' }, { }, function(error, data){
        console.log(error);
        console.log(data);
        done();
      });
    })
  });
  describe.skip('public/private stores', function(){
    it('set public should return all public stores', function(done){
      sut.setPublic('ademo', function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.grant, true);
        assert.equal(data.name, 'ademo');

        var actualRights = sut.getRights().public;
        assert.equal(actualRights.length, 1);
        assert.equal(actualRights[0], 'ademo');
        
        done();
      });
    }),
    it('set private should return only the public stores', function(done){
      sut.setPrivate('ademo', function(error, data){
        assert.equal(error, undefined);
        assert.equal(data.grant, false);
        assert.equal(data.name, 'ademo');

        var actualRights = sut.getRights().public;
        assert.equal(actualRights.length, 0);

        done();
      });
    }),
    it('a name that not found should return error message', function(done){
      sut.setPrivate('notmatch', function(error, data){
        assert.notEqual(error, undefined);
        assert.equal(error.message, 'store not found');
        done();
      });
    });
  });
  describe.skip('import/export', function(){
    it('should import data to import1', function(done){
      var data = [
        { key: 'name', value: 'Yuri Irsenovich Kim' },
        { key: 'dob', value: '16 February 1941' },
        { key: 'spouse', value: 'Kim Young-sook' },
        { key: 'occupation', value: 'Clown' }
        ];
      sut.imports('import1', data, function(error){
        assert.equal(error, undefined);
        sut.read('import1', {}, function(error, data){
          assert.notEqual(data, undefined);
          assert.equal(data.length, 4);
          assert.equal(data[0].store, 'import1');
          done();
        });
      });
    }),
    it('should import raw data', function(done){
      var data = [
        { key: 'import2!name', value: 'Yuri Irsenovich Kim' },
        { key: 'import2!dob', value: '16 February 1941' },
        { key: 'import2!spouse', value: 'Kim Young-sook' },
        { key: 'import2!occupation', value: 'Clown' }
        ];
      sut.imports('', data, function(error){
        assert.equal(error, undefined);
        sut.read('import2', {}, function(error, data){
          assert.notEqual(data, undefined);
          assert.equal(data.length, 4);
          assert.equal(data[0].store, 'import2');
          done();
        });
      });
    }),
    it('should export import1 data', function(done){
      sut.exports('import1', function(error, data){
        assert.equal(error, undefined);
        assert.notEqual(data, undefined);
        assert.equal(data.length, 4);
        assert.equal(data[0].key, 'dob');
        done();
      });
    }),
    it('should export all data', function(done){
      sut.exports('', function(error, data){
        assert.equal(error, undefined);
        assert.notEqual(data, undefined);
        assert.equal(data.length, 30);
        assert.equal(data[17].key, 'spouse');
        done();
      });
    });
  });
  describe.skip('backup/restore', function(){
    it('should backup/restore the complete DB to path', function(done){
      sut.backup(function(error, data){
        assert.equal(error, undefined);
        assert.notEqual(data, undefined);
        sut.restore(data, function(error){
          assert.equal(error, undefined);
          done();
        });
      });
    });
  });
  describe.skip('statistics', function(){
    it('should get the current db size', function(done){
      sut.statistics(function(error, data){
          done();
      });
    });
  });
  describe.skip('notifications', function(){
    it('on change should push changed data', function(done){
      sut.onChange(function(changed){
        assert.equal(changed.key, 'notifications!first');
      });
      sut.upsert('notifications', 'first', {test: 'notifications test 1'}, function(error){
        sut.del('notifications', 'first', function(error){
        });
      });
      var ops = [
        { type: 'put', key: 'notifications!first', value: 'notifications test 2' },
        { type: 'put', key: 'notifications!first', value: 'notifications test 3' },
        { type: 'del', key: 'notifications!first' }
      ];
      sut.batch(ops, function(error){
        done();
      });
    });
  });
});