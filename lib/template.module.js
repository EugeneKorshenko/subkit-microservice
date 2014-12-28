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

        var _render = function(name, options, done){
            var pathToFile = path.join(config.templatesPath, name + '.jshtml');
            if(!fs.existsSync(pathToFile)){
                pathToFile = path.join(config.staticsPath, name);
            }
            var localOptions = {};

            localOptions._locals = options;
            try{
                renderer(pathToFile, localOptions, done);
            }catch(e){
                done(e);
            }
        };

        _init(config);

        return {
            init: _init,
            render: _render
        };
};