module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
        },
        src: ['tests/spec.js']
      }
    }
  });
  grunt.registerTask('default', ['mochaTest']);
};