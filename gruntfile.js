'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-markdox');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: [        
        'test/unit/store.module.spec.js',
        'test/unit/event.module.spec.js',
        'test/unit/task.module.spec.js',
        'test/unit/template.module.spec.js',
        'test/unit/eventsource.module.spec.js',
        'test/unit/identity.module.spec.js',
        'test/unit/share.module.spec.js',
        'test/unit/file.module.spec.js',
        'test/unit/plugin.module.spec.js',

        'test/integration/store-operations.spec.js',
        'test/integration/store-query.spec.js',
        'test/integration/task.spec.js',
        'test/integration/event.spec.js',
        'test/integration/manage.spec.js',
        'test/integration/share.spec.js',
        
        'lib/utils.module.js',
        'lib/store.module.js',
        'lib/event.module.js',
        'lib/logger.module.js',        
        'lib/eventsource.module.js',
        'lib/identity.module.js',
        'lib/template.module.js',
        'lib/task.module.js',
        'lib/share.module.js',
        'lib/file.module.js',
        'lib/plugin.module.js',

        'routes/manage.js',
        'routes/store.js',
        'routes/stream.js',
        'routes/event.js',
        'routes/task.js',

        'gruntfile.js',
        'supervisor.js',
        'server.js',
        'dev.js',
        'prod.js'
      ],
      options: {
        jshintrc: '.jshintrc',
        force: true
      }
    },
    mochaTest: {
      shareTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false,
          require: 'env-test'
        },
        src: [
          'test/unit/share.module.spec.js',
          'test/integration/share.spec.js'
        ]
      },
      eventTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false,
          require: 'env-test'
        },
        src: [
          'test/unit/event.module.spec.js',
          'test/integration/event.spec.js'
        ]
      },      
      storeTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false,
          require: 'env-test'          
        },
        src: [
          'test/unit/store.module.spec.js',
          'test/integration/store-operations.spec.js',
          'test/integration/store-query.spec.js'
        ]
      },
      taskTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false,
          require: 'env-test'          
        },
        src: [
          'test/unit/task.module.spec.js',
          'test/integration/task.spec.js'
        ]
      },
      fileTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false,
          require: 'env-test'          
        },
        src: [
          'test/unit/file.module.spec.js'
        ]
      },
      identityTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false,
          require: 'env-test'          
        },
        src: [
          'test/unit/identity.module.spec.js'
        ]
      },
      pluginTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false,
          require: 'env-test'          
        },
        src: [
          'test/unit/plugin.module.spec.js'
        ]
      },
      manageTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false,
          require: 'env-test'          
        },
        src: [
          'test/integration/manage.spec.js'
        ]
      },
      smokeTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false,
          require: 'env-test'
        },
        src: [
          'test/smoke/event.smoke.js',
          'test/smoke/event-projection.smoke.js'
        ]
      }
    },
    markdox: {
      target: {
        files: [
          {src: 'lib/store.module.js', dest: 'docs/store.md'},
          {src: 'lib/event.module.js', dest: 'docs/event.md'},
          {src: 'lib/logger.module.js', dest: 'docs/logger.md'},
          {src: 'lib/task.module.js', dest: 'docs/task.md'},
          {src: 'lib/identity.module.js', dest: 'docs/identity.md'},
          {src: 'lib/file.module.js', dest: 'docs/file.md'},
          {src: 'lib/template.module.js', dest: 'docs/template.md'},
          {src: 'lib/plugin.module.js', dest: 'docs/plugin.md'},
          {src: 'lib/share.module.js', dest: 'docs/share.md'},
          {src: 'lib/eventsource.module.js', dest: 'docs/eventsource.md'}
        ]
      }
    }
  });
  grunt.registerTask('default', []);
  grunt.registerTask('docs', ['markdox']);
  grunt.registerTask('test', [
    'jshint',
    'mochaTest:shareTests',
    'mochaTest:storeTests',
    'mochaTest:eventTests',
    'mochaTest:taskTests',
    'mochaTest:fileTests',
    'mochaTest:identityTests',
    'mochaTest:pluginTests',
    'mochaTest:manageTests',
    'mochaTest:smokeTests'
  ]);
  grunt.registerTask('shareTests', ['mochaTest:shareTests']);
  grunt.registerTask('storeTests', ['mochaTest:storeTests']);
  grunt.registerTask('eventTests', ['mochaTest:eventTests']);
  grunt.registerTask('taskTests', ['mochaTest:taskTests']);
  grunt.registerTask('fileTests', ['mochaTest:fileTests']);
  grunt.registerTask('identityTests', ['mochaTest:identityTests']);
  grunt.registerTask('pluginTests', ['mochaTest:pluginTests']);
  grunt.registerTask('manageTests', ['mochaTest:manageTests']);
  grunt.registerTask('smokeTests', ['mochaTest:smokeTests']);
};