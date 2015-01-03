'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-markdox');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: [
        'test/store.module.spec.js',
        'test/event.module.spec.js',
        'test/task.module.spec.js',
        'test/template.module.spec.js',
        'test/eventsource.module.spec.js',
        'test/identity.module.spec.js',
        'test/share.module.spec.js',
        'test/file.module.spec.js',
        'test/plugin.module.spec.js',

        'test/store.spec.js',
        'test/task.spec.js',
        'test/manage.spec.js',
        'test/share.spec.js',
        
        'lib/utils.module.js',
        'lib/doc.module.js',
        'lib/store.module.js',
        'lib/event.module.js',
        'lib/eventsource.module.js',
        'lib/identity.module.js',
        'lib/template.module.js',
        'lib/task.module.js',
        'lib/share.module.js',
        'lib/file.module.js',
        'lib/plugin.module.js',

        'lib/plugin.js',        
        'lib/manage.js',
        'lib/store.js',
        'lib/event.js',
        'lib/task.js',
        'lib/share.js',
        'lib/statistics.js',

        'gruntfile.js',
        'supervisor.js',
        'server.js',
        'index.js'
      ],
      options: {
        jshintrc: '.jshintrc',
        force: true
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false
        },
        src: [
          'test/manage.spec.js',
          'test/template.module.spec.js',
          'test/eventsource.module.spec.js'
        ]
      },
      shareTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false
        },
        src: [
          'test/share.module.spec.js',
          'test/share.spec.js'
        ]
      },
      eventTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false
        },
        src: [
          'test/event.module.spec.js',
          'test/event.spec.js'
        ]
      },      
      storeTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false
        },
        src: [
          'test/store.module.spec.js',
          'test/store.spec.js'
        ]
      },
      taskTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false
        },
        src: [
          'test/task.module.spec.js',
          'test/task.spec.js'
        ]
      },
      fileTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false
        },
        src: [
          'test/file.module.spec.js'
        ]
      },
      identityTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false
        },
        src: [
          'test/identity.module.spec.js'
        ]
      },
      pluginTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: false
        },
        src: [
          'test/plugin.module.spec.js'
        ]
      }      
    },
    markdox: {
      target: {
        files: [
          {src: 'lib/store.module.js', dest: 'docs/store.md'},
          {src: 'lib/event.module.js', dest: 'docs/event.md'},
          {src: 'lib/task.module.js', dest: 'docs/task.md'},
          {src: 'lib/identity.module.js', dest: 'docs/identity.md'},
          {src: 'lib/file.module.js', dest: 'docs/file.md'},
          {src: 'lib/template.module.js', dest: 'docs/template.md'},
          {src: 'lib/plugin.module.js', dest: 'docs/plugin.md'},
          {src: 'lib/share.module.js', dest: 'docs/share.md'},
          {src: 'lib/eventsource.module.js', dest: 'docs/eventsource.md'},
        ]
      }
    }
  });
  grunt.registerTask('default', []);
  grunt.registerTask('test', ['jshint','mochaTest:test','mochaTest:shareTests','mochaTest:storeTests','mochaTest:eventTests','mochaTest:taskTests','mochaTest:fileTests','mochaTest:identityTests','mochaTest:pluginTests']);
  grunt.registerTask('shareTests', ['mochaTest:shareTests']);
  grunt.registerTask('storeTests', ['mochaTest:storeTests']);
  grunt.registerTask('eventTests', ['mochaTest:eventTests']);
  grunt.registerTask('taskTests', ['mochaTest:taskTests']);
  grunt.registerTask('fileTests', ['mochaTest:fileTests']);
  grunt.registerTask('identityTests', ['mochaTest:identityTests']);
  grunt.registerTask('pluginTests', ['mochaTest:pluginTests']);
  grunt.registerTask('docs', ['markdox']);
};