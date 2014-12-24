'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-markdox');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: [
        'test/store.module.spec.js',
        'test/pubsub.module.spec.js',
        'test/task.module.spec.js',
        'test/template.module.spec.js',
        'test/eventsource.module.spec.js',
        'test/identity.module.spec.js',
        'test/share.module.spec.js',
        'test/file.module.spec.js',

        'test/store.spec.js',
        'test/task.spec.js',
        'test/manage.spec.js',
        'test/share.spec.js',
        
        'lib/helper.js',
        'lib/doc.module.js',
        'lib/store.module.js',
        'lib/pubsub.module.js',
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
        'lib/pubsub.js',
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
          'test/pubsub.module.spec.js',
          'test/template.module.spec.js',
          'test/eventsource.module.spec.js',
          'test/identity.spec.js',
          'test/identity.module.spec.js',
          'test/file.module.spec.js',
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
          'test/identity.module.spec.js',
          'test/identity.spec.js'
        ]
      }
    },
    jsdoc : {
      dist : {
          src: [
            'lib/store.module.js',
            'lib/pubsub.module.js',
            'lib/eventsource.module.js',
            'lib/plugin.module.js',
            'lib/share.module.js',
            'lib/task.module.js',
            'lib/file.module.js',
            'lib/template.module.js',
            'lib/identity.module.js',
          ], 
          options: {
              destination: 'docs/modules/html'
          }
      }
    },
    markdox: {
      target: {
        files: [
          {src: 'lib/store.module.js', dest: 'docs/modules/store.md'},
          {src: 'lib/pubsub.module.js', dest: 'docs/modules/pubsub.md'},
          {src: 'lib/task.module.js', dest: 'docs/modules/task.md'},
          {src: 'lib/identity.module.js', dest: 'docs/modules/identity.md'},
          {src: 'lib/file.module.js', dest: 'docs/modules/file.md'},
          {src: 'lib/template.module.js', dest: 'docs/modules/template.md'},
          {src: 'lib/plugin.module.js', dest: 'docs/modules/plugin.md'},
          {src: 'lib/share.module.js', dest: 'docs/modules/share.md'},
          {src: 'lib/eventsource.module.js', dest: 'docs/modules/eventsource.md'},
        ]
      }
    }
  });
  grunt.registerTask('default', []);
  grunt.registerTask('test', ['jshint','mochaTest:test','mochaTest:shareTests','mochaTest:storeTests','mochaTest:taskTests','mochaTest:fileTests','mochaTest:identityTests']);
  grunt.registerTask('shareTests', ['mochaTest:shareTests']);
  grunt.registerTask('storeTests', ['mochaTest:storeTests']);
  grunt.registerTask('taskTests', ['mochaTest:taskTests']);
  grunt.registerTask('fileTests', ['mochaTest:fileTests']);
  grunt.registerTask('identityTests', ['mochaTest:identityTests']);
  grunt.registerTask('doc', ['jsdoc', 'markdox']);
};