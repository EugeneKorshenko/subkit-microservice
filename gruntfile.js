'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: [
        'Gruntfile.js',
        'test/store.module.spec.js',
        'test/identity.module.spec.js',
        'test/pubsub.module.spec.js',
        'test/task.module.spec.js',
        'test/template.module.spec.js',
        'test/eventsource.module.spec.js',

        'test/store.spec.js',
        'test/identity.spec.js',
        
        'lib/helper.js',
        'lib/doc.module.js',
        'lib/store.module.js',
        'lib/pubsub.module.js',
        'lib/identity.module.js',
        'lib/eventsource.module.js',
        'lib/template.module.js',
        'lib/task.module.js',

        'lib/store.js',
        'lib/pubsub.js',

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
          timeout: 10000
        },
        src: ['test/*.module.spec.js', 'test/store.spec.js', 'test/identity.spec.js']
      }
    },
    less: {
      development: {
        options: {
          paths: 'files/mobile/css',
          cleancss: true
        },
        files: {
          'files/mobile/css/style.css': 'files/mobile/css/style.less'
        }
      }
    },
    watch: {
        files: ['files/mobile/css/custom.less'],
        tasks: ['less']
    }
  });
  grunt.registerTask('default', []);
  grunt.registerTask('css', ['less']);
  grunt.registerTask('test', [
    'jshint',
    'mochaTest'
  ]);
};