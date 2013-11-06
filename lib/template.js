var fs = require("fs"),
        path = require("path"),
        renderer = require("jshtml-express");

var templatesPath;
        
function render(templateName, options, done){
        var pathToFile = path.join(templatesPath, templateName + ".jshtml"),
                localOptions = {};
        localOptions["_locals"] = options;
        renderer(pathToFile, localOptions, done);
}

function list(){
        throw new Error("not implemented");
}

function read(templateName){
        throw new Error("not implemented");
}

function save(templateName){
        throw new Error("not implemented");
}

module.exports.init = function(config){
        templatesPath = config.templatesPath;

        return {
                render: render,
                list: list,
                save: save,
                read: read
        }
}