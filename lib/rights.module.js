module.exports.init = function(conf){
	if(!conf) throw new Error("No config parameter found.");

	var _config = conf;
	var _rights = {};

	var _writeRights = function(){
		fs.writeFileSync(_config.rightsPath, JSON.stringify(_rights));
	};
	var _readRights = function(){
		var data = fs.readFileSync(_config.rightsPath);
		_rights = JSON.parse(data);
	};
	var _setPublicRead = function(storeName, callback){
		var match = _rights.Readable.indexOf(storeName);

		if(match === -1){
			_rights.Readable.push(storeName);
			_writeRights();
			callback(null, {
				grant: true,
				name: storeName
			});
		}else{
			callback(new Error("Resource not found."));
		}
	};
	var _setPublicWrite = function(storeName, callback){
		var match = _rights.Writable.indexOf(storeName);

		if(match === -1){
			_rights.Writable.push(storeName);
			_writeRights();
			callback(null, {
				grant: true,
				name: storeName
			});
		}else{
			callback(new Error("Resource not found."));
		}
	};
	var _setPrivateRead = function(storeName, callback){
		var match = _rights.Readable.indexOf(storeName);

		if(match !== -1){
			_rights.Readable.splice(match, 1);
			_writeRights();
			callback(null, {
				grant: false,
				name: storeName
			});
		}else{
			callback(new Error("Resource not found."));
		}
	};
	var _setPrivateWrite = function(storeName, callback){
		var match = _rights.Writable.indexOf(storeName);

		if(match !== -1){
			_rights.Writable.splice(match, 1);
			_writeRights();
			callback(null, {
				grant: false,
				name: storeName
			});
		}else{
			callback(new Error("Resource not found."));
		}
	};

	//rights file refresh on change
	fs.watchFile(_config.rightsPath, function (curr, prev) {
		console.log("rights file changed - reload.");
		_readRights();
	});

	//init
	_readRights();

	return {
		getRights: function(){ return _rights; },
		setPublicRead: _setPublicRead,
		setPrivateRead: _setPrivateRead,
		setPublicWrite: _setPublicWrite,
		setPrivateWrite: _setPrivateWrite
	}
}