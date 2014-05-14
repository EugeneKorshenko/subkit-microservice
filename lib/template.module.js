'use strict';

var fs = require('fs'),
    path = require('path'),
    renderer = require('jshtml-express');

module.exports.init = function(config){

        var _render = function(templateName, options, done){
                var pathToFile = path.join(config.templatesPath, templateName + '.jshtml'),
                localOptions = {};
                localOptions._locals = options;
                renderer(pathToFile, localOptions, done);
        };

        return {
                render: _render
        };
};