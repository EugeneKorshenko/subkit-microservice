var crypto = require('crypto');

module.exports.init = function(){
  var SaltLength = 9;

  var _createHash = function(password) {
    var salt = _generateSalt(SaltLength);
    var hash = md5(password + salt);
    return salt + hash;
  };
  var _validateHash = function(hash, password) {
    var salt = hash.substr(0, SaltLength);
    var validHash = salt + md5(password + salt);
    return hash === validHash;
  }
  var _generateSalt = function(len) {
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',
        setLen = set.length,
        salt = '';
    for (var i = 0; i < len; i++) {
      var p = Math.floor(Math.random() * setLen);
      salt += set[p];
    }
    return salt;
  };
  var md5 = function(string) {
    return crypto.createHash('md5').update(string).digest('hex');
  };

  return {
    hash: _createHash,
    validate: _validateHash
  };
};