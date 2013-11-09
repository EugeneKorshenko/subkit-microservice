'use strict';
var Subkit = function(config){
	var self = this;

	self.UUID = function () {
		// http://www.ietf.org/rfc/rfc4122.txt
		var s = [];
		var hexDigits = "0123456789abcdef";
		for (var i = 0; i < 36; i++) {
		    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";

		var uuid = s.join("");
		return uuid;
	};
	var getXhr = function (callback) {
		if (window.XMLHttpRequest) {
		  return callback(null, new XMLHttpRequest());
		} else if (window.ActiveXObject) {
		  try {
		    return callback(null, new ActiveXObject("Msxml2.XMLHTTP"));
		  } catch (e) {
		    return callback(null, new ActiveXObject("Microsoft.XMLHTTP"));
		  }
		}
		return callback(new Error());
	};
	var encodeUsingUrlEncoding = function (data) {
		if(typeof data === 'string') {
		  return data;
		}

		var result = [];
		for(var dataItem in data) {
		  if(data.hasOwnProperty(dataItem)) {
		    result.push(encodeURIComponent(dataItem) + '=' + encodeURIComponent(data[dataItem]));
		  }
		}

		return result.join('&');
	};
	var utf8 = function (text) {
		text = text.replace(/\r\n/g, '\n');
		var result = '';

		for(var i = 0; i < text.length; i++) {
		  var c = text.charCodeAt(i);

		  if(c < 128) {
		      result += String.fromCharCode(c);
		  } else if((c > 127) && (c < 2048)) {
		      result += String.fromCharCode((c >> 6) | 192);
		      result += String.fromCharCode((c & 63) | 128);
		  } else {
		      result += String.fromCharCode((c >> 12) | 224);
		      result += String.fromCharCode(((c >> 6) & 63) | 128);
		      result += String.fromCharCode((c & 63) | 128);
		  }
		}

		return result;
	};
	var base64 = function (text) {
		var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

		text = utf8(text);
		var result = '',
		    chr1, chr2, chr3,
		    enc1, enc2, enc3, enc4,
		    i = 0;

		do {
		  chr1 = text.charCodeAt(i++);
		  chr2 = text.charCodeAt(i++);
		  chr3 = text.charCodeAt(i++);

		  enc1 = chr1 >> 2;
		  enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		  enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		  enc4 = chr3 & 63;

		  if(isNaN(chr2)) {
		    enc3 = enc4 = 64;
		  } else if(isNaN(chr3)) {
		    enc4 = 64;
		  }

		  result +=
		    keyStr.charAt(enc1) +
		    keyStr.charAt(enc2) +
		    keyStr.charAt(enc3) +
		    keyStr.charAt(enc4);
		  chr1 = chr2 = chr3 = '';
		  enc1 = enc2 = enc3 = enc4 = '';
		} while(i < text.length);

		return result;
	};
	var mergeHeaders = function () {
		var result = arguments[0];
		for(var i = 1; i < arguments.length; i++) {
		  var currentHeaders = arguments[i];
		  for(var header in currentHeaders) {
		    if(currentHeaders.hasOwnProperty(header)) {
		      result[header] = currentHeaders[header];
		    }
		  }
		}
		return result;
	};
	var ajax = function (method, url, options, callback) {
		if(typeof options === 'function') {
		  callback = options;
		  options = {};
		}
		options.cache = options.cache || false;
		options.headers = options.headers || {};
		options.jsonp = options.jsonp || false;

		var headers = mergeHeaders({
		  'accept': '*/*',
		  'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
		  'apiKey': options.apiKey,
		}, ajax.headers, options.headers);

		if(options.data) {
			var payload;
			if (headers['content-type'] === 'application/json') {
			  payload = JSON.stringify(options.data);
			} else {
			  payload = encodeUsingUrlEncoding(options.data);      
			}
		}

		if(method === 'GET') {
		  var queryString = [];
		  if(payload) {
		    queryString.push(payload);
		    payload = null;
		  }

		  if(!options.cache) {
		    queryString.push('_=' + (new Date()).getTime());
		  }

		  if(options.jsonp) {
		    queryString.push('callback=' + options.jsonp);
		    queryString.push('jsonp=' + options.jsonp);
		  }

		  queryString = '?' + queryString.join('&');
		  url += queryString !== '?' ? queryString : '';

		  if(options.jsonp) {
		    var head = document.getElementsByTagName('head')[0];
		    var script = document.createElement('script');
		    script.type = 'text/javascript';
		    script.src = url;
		    head.appendChild(script);        
		    return;
		  }
		}

		getXhr(function (err, xhr) {
		  if(err) return callback(err);
		  xhr.open(method, url, options.async || true);
		  for(var header in headers) {
		    if(headers.hasOwnProperty(header)) {
		      xhr.setRequestHeader(header, headers[header]);
		    }
		  }

		  xhr.onreadystatechange = function () {
		    if(xhr.readyState === 4) {
		      var data = xhr.responseText || '';
		      if(!callback) {
		        return;
		      }
		      callback(xhr.status, {
		        text: function () {
		          return data;
		        },

		        json: function () {
		          return JSON.parse(data);
		        }
		      });
		    }
		  };

		  xhr.send(payload);
		});
	};
	var httpRequest = {
		authBasic: function (username, password) {
		  httpRequest.headers({});
		  ajax.headers['Authorization'] = 'Basic ' + base64(username + ':' + password);
		},

		connect: function (url, options, callback) {
		  return ajax('CONNECT', url, options, callback);      
		},

		del: function (url, options, callback) {
		  return ajax('DELETE', url, options, callback);      
		},

		get: function (url, options, callback) {
		  return ajax('GET', url, options, callback);
		},

		head: function (url, options, callback) {
		  return ajax('HEAD', url, options, callback);
		},

		headers: function (headers) {
		  ajax.headers = headers || {};
		},

		isAllowed: function (url, verb, callback) {
		  this.options(url, function (status, data) {
		    callback(data.text().indexOf(verb) !== -1);
		  });
		},

		options: function (url, options, callback) {
		  return ajax('OPTIONS', url, options, callback);
		},

		patch: function (url, options, callback) {
		  return ajax('PATCH', url, options, callback);      
		},

		post: function (url, options, callback) {
		  return ajax('POST', url, options, callback);      
		},

		put: function (url, options, callback) {
		  return ajax('PUT', url, options, callback);      
		},

		trace: function (url, options, callback) {
		  return ajax('TRACE', url, options, callback);
		}
	};

	var _init = function(clientId){
		var clientId = sessionStorage.getItem("clientId");
		if(!clientId) {
			clientId = self.UUID();
			sessionStorage.setItem("clientId", clientId);
		}
		return clientId;
	};
	self.clientId = config.clientId || _init();
	self.baseUrl = config.baseUrl || "http://try.subkit.io";
    self.options = { 
    	apiKey: config.apiKey || "",
    	username: config.username || "",
    	password: config.password || "",
    	headers : {
    		'content-type': 'application/json'
    	}
    };
	var statusListeners = [];
	self.subscribed = {};
	
	var changeStatus = function(status){
		console.log(status);
		statusListeners.forEach(function(listener){
			listener(status);
		});
	};

	self.set = function(key, value, callback){
		key = key.replace(/^[a-zA-z0-9]\/\//, "!");
		var url = self.baseUrl + "/store/" + key;
		var msg = JSON.parse(JSON.stringify(self.options));
		msg["data"] = value;
		httpRequest.post(url, msg, function(status, result){
			if(status!==200) {
				if(callback) changeStatus(result);
			}else{
				if(callback) callback(null, result.json());
			}
		});
	};

	self.get = function(key, callback){
		key = key.replace(/^[a-zA-z0-9]\/\//, "!");
		var url = self.baseUrl + "/" + key;
		httpRequest.get(url, self.options, function(status, result){
			if(status !== 200) {
				callback(result);
			}else{
				callback(null, result.json());
			}
		});
	}

	self.push = function(channel, value, callback){
		var url = self.baseUrl + "/channel/publish/" + channel;
		var msg = JSON.parse(JSON.stringify(self.options));
		msg["data"] = value;
		httpRequest.post(url, msg, function(status, result){
			if(status!==200) {
				if(callback) changeStatus(result);
			}else{
				if(callback) callback(null, result.json());
			}
		});
	}

	self.on = function(channel, callback) {
		channel = channel.replace("/", "_");
		self.subscribed[channel] = true;
		changeStatus("subscribed to " + channel);
		var pollingRef = _poll(channel, self.clientId, callback);
		return {
			off: function(){
				self.off(channel, pollingRef);
			},
			set: function(key, value, callback){
				self.set(channel+"/"+key, value, callback);
			},
			push: function(value, callback){
				self.push(channel, value, callback);
			}
		}
	};

	self.off = function(channel, pollingRef){
		delete self.subscribed[channel];
		clearTimeout(pollingRef);
	}

	var _poll = function(channel, clientId, callback) {
		var intervalRef = null;
		var subscribeUrl = self.baseUrl + "/subscribe/" + channel + "/" + clientId;
		httpRequest.get(subscribeUrl, self.options, function(status, result){
			if(status !== 200) {
				callback({error:"subscription error - retry"});
				intervalRef = setTimeout(function() { if(self.subscribed[channel]) _poll(channel, clientId, callback); }, 250);
			}else{
				result.json().forEach(function(item){
					callback(item.data);
				});
				intervalRef = setTimeout(function(){ if(self.subscribed[channel]) _poll(channel, clientId, callback); }, 0);	
			}
		});
		return intervalRef;
	};
}