'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-markdox');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: [
        'Gruntfile.js',
        'test/store.module.spec.js',
        'test/pubsub.module.spec.js',
        'test/worker.module.spec.js',
        'test/template.module.spec.js',
        'test/eventsource.module.spec.js',
        'test/rights.module.spec.js',
        'test/file.module.spec.js',
        'test/store.spec.js',
        
        'lib/helper.js',
        'lib/doc.module.js',
        'lib/store.module.js',
        'lib/pubsub.module.js',
        'lib/eventsource.module.js',
        'lib/template.module.js',
        'lib/worker.module.js',
        'lib/rights.module.js',
        'lib/file.module.js',
        'lib/plugin.module.js',

        'lib/plugin.js',        
        'lib/manage.js',
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
        src: [
          'test/*.module.spec.js',
          'test/manage.spec.js',
          'test/store.spec.js'
        ]
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
    },
    jsdoc : {
      dist : {
          src: [
            'lib/store.module.js',
            'lib/pubsub.module.js'
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
          {src: 'lib/pubsub.module.js', dest: 'docs/modules/pubsub.md'}
        ]
      }
    }
  });
  grunt.registerTask('default', []);
  grunt.registerTask('css', ['less']);
  grunt.registerTask('test', [
    'jshint',
    'mochaTest'
  ]);
  grunt.registerTask('doc', ['jsdoc', 'markdox']);
};