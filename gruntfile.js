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
        'test/worker.module.spec.js',
        'test/template.module.spec.js',
        'test/eventsource.module.spec.js',
        'test/identity.module.spec.js',
        'test/share.module.spec.js',
        'test/file.module.spec.js',

        'test/store.spec.js',
        'test/worker.spec.js',
        'test/manage.spec.js',
        'test/share.spec.js',
        
        'lib/helper.js',
        'lib/doc.module.js',
        'lib/store.module.js',
        'lib/pubsub.module.js',
        'lib/eventsource.module.js',
        'lib/identity.module.js',
        'lib/template.module.js',
        'lib/worker.module.js',
        'lib/share.module.js',
        'lib/file.module.js',
        'lib/plugin.module.js',

        'lib/plugin.js',        
        'lib/manage.js',
        'lib/store.js',
        'lib/pubsub.js',
        'lib/worker.js',
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
          clearRequireCache: true
        },
        src: [
          'test/*.module.spec.js',
          'test/manage.spec.js',
          'test/store.spec.js',
          'test/worker.spec.js',
          'test/share.spec.js',
          'test/plugin.spec.js',
          'test/pubsub.spec.js',
          'test/statistics.spec.js',
          'test/identity.spec.js',
          'test/file.spec.js'
        ]
      },
      shareTests: {
        options: {
          reporter: 'spec',
          timeout: 10000,
          clearRequireCache: true
        },
        src: [
          'test/share.module.spec.js',
          'test/share.spec.js'
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
            'lib/worker.module.js',
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
          {src: 'lib/worker.module.js', dest: 'docs/modules/worker.md'},
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
  grunt.registerTask('test', ['jshint','mochaTest']);
  grunt.registerTask('shareTests', ['mochaTest:shareTests']);
  grunt.registerTask('doc', ['jsdoc', 'markdox']);
};