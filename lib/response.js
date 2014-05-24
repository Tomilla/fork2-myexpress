var extension = {}
  , http = require('http')
  , mime = require('mime')
  , accepts = require('accepts');

extension.isExpress = true;
extension.__proto__ = http.ServerResponse.prototype;
extension.redirect = function(statusCode, originUrl) {
  if (!originUrl) {
    originUrl = statusCode;
    statusCode = 302;
  }
  this.writeHead(statusCode, {
    'Location': originUrl,
    'Content-Length': 0
  });
  this.end();
};

extension.type = function (extInPath) {
  this.setHeader('Content-Type', [mime.lookup(extInPath)]);
};

extension.default_type = function (extInPath) {
  // Note that the name is case insensitive
  var contentType = this.getHeader('content-type');
  if (!contentType) {
    this.setHeader('Content-Type', [mime.lookup(extInPath)]);
  }
};

extension.format = function (hashTable) {
  var accept = accepts(this.req)
    , setOfType = Object.keys(hashTable)
    , type = accept.types(setOfType);

  if (type.length > 0) {
    this.type(type);
    hashTable[type]();
  } else {
    var error = new Error("Not Acceptable");
    error.statusCode = 406;
    throw error;
  }
};

extension.send = function() {
  var body = arguments[0];

  if (typeof body == 'string') {
    this.default_type('text/html');
  } else if (body instanceof Buffer) {
    this.default_type('application/octet-stream');
  } else if (body instanceof JSON) {
    // in third case, the `Content-Type` is `body` itself
    this.default_type(body);
  }
    this.end(body);
};

module.exports = extension;
