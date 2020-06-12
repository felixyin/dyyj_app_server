/**
 * Created by fy on 15-9-13.
 */
'use strict';


var fs = require('fs');

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            live: {
                files: '**/*',
                options: {
                    livereload: true /*35729*/
                }
            }
        }
    });

    //require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('watch', ['watch']);


};