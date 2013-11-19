module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
        },
        src: ['tests/spec.js']
      }
    },
    less: {
      development: {
        options: {
          paths: "files/mobile/css",
          cleancss: true
        },
        files: {
          "files/mobile/css/style.css": "files/mobile/css/style.less"
        }
      }
    }
  });
  grunt.registerTask('default', ['mochaTest']);
  grunt.registerTask('css', ['less']);
};