'use strict';

var swagger = require('swagger-doc');

module.exports.configure = function(server, options){
	swagger.configure(server, options);
	return function(name, description){
		return swagger.createResource('/docs/'+name, {description: description});
	};
};