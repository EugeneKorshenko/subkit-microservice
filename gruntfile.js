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
        'test/store.spec.js',
        'test/identity.spec.js',
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
        src: ['test/*.spec.js']
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