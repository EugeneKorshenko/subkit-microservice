'use strict';

var fs = require('fs'),
    path = require('path'),
    renderer = require('jshtml-express');

module.exports.init = function(config){
        var _mkdirRecursive = function(dirPath, mode) {
            try{
                fs.mkdirSync(dirPath, mode);
            }catch(e){
                if(e && e.errno === 34){
                    _mkdirRecursive(path.dirname(dirPath), mode);
                    _mkdirRecursive(dirPath, mode);
                }
            }
        };
        var _init = function(templateConfig){
            config = templateConfig;

            if(!fs.existsSync(config.templatesPath))
                _mkdirRecursive(config.templatesPath);
        };

        var _render = function(templateName, options, done){
            var pathToFile = path.join(config.templatesPath, templateName + '.jshtml'),
            localOptions = {};
            localOptions._locals = options;
            renderer(pathToFile, localOptions, done);
        };

        _init(config);

        return {
            init: _init,
            render: _render
        };
};