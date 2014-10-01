'use strict';

var HTTP_METHODS = ['get', 'post', 'put', 'delete', 'head'],
    DOC_VERSION = '1.0';

function Resource(path, options) {
  options = options || {};

  this.path = path;
  this.models = options.models || {};
  this.apis = {};
}

Resource.prototype.getApi = function(path) {
  if (!(path in this.apis)) {
    this.apis[path] = {
      path: path,
      description: '',
      operations: []
    };
  }
  return this.apis[path];
};

var operationType = function(method) {
  method = method.toUpperCase();

  return function(path, summary, operation) {
    if (!operation) {
      operation = summary;
      summary = '';
    } else {
      operation.summary = summary;
    }
    operation.httpMethod = method;

    var api = this.getApi(path);
    api.operations.push(operation);
  };
};

for (var i = 0; i < HTTP_METHODS.length; i++) {
  var m = HTTP_METHODS[i];
  Resource.prototype[m] = operationType(m);
}


var doc = {};

doc.Resource = Resource;

doc.resources = [];

doc.configure = function(server, options) {
  options = options || {};

  var discoveryUrl = options.discoveryUrl || '/resources.json',
      self = this;

  this.server = server;
  this.apiVersion = options.version || this.server.version || '0.1';
  this.basePath = options.basePath;

  this.server.get(discoveryUrl, function(req, res) {
    var result = self._createResponse(req);
    result.apis = self.resources.map(function(r) { return {path: r.path, description: ''}; });

    res.send(result);
  });
};

doc.createResource = function(path, options) {
  var resource = new Resource(path, options),
      self = this;
  this.resources.push(resource);

  this.server.get(path, function(req, res) {
    var result = self._createResponse(req);
    result.resourcePath = path;
    result.apis = Object.keys(resource.apis).map(function(k) { return resource.apis[k]; });
    result.models = resource.models;

    res.send(result);
  });

  return resource;
};

doc._createResponse = function(req) {
  var basePath = this.basePath || 'http://' + req.headers.host;
  return {
    docVersion: DOC_VERSION,
    apiVersion: this.apiVersion,
    basePath: basePath
  };
};


module.exports.configure = function(server, options){
	doc.configure(server, options);
	return function(name, description){
		return doc.createResource('/docs/'+name, {description: description});
	};
};