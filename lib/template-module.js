var fs = require("fs"),
        path = require("path"),
        renderer = require("jshtml-express");

module.exports.init = function(config){
        
        function render(templateName, options, done){
                var pathToFile = path.join(config.templatesPath, templateName + ".jshtml"),
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
        
        return {
                render: render,
                list: list,
                save: save,
                read: read
        }
}