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

extension.send = function(status, body) {
  if (body) {
    this.statusCode = status;
  } else {
    body = status;
  }

  // if arguments length less than 2
  // , assign `status` value to `body`
  //body = body || status;

  if (typeof body == 'number') {
    this.default_type('text/plain');
    // when status code in given
    // , reponds it as default status code
    this.statusCode = body;
    body = http.STATUS_CODES[body];
  } else if (typeof body == 'string') {
    this.default_type('text/html');
  } else if (body instanceof Buffer) {
    this.default_type('application/octet-stream');
  } else if (typeof body == 'object') {
    // in third case, the `Content-Type` is `body` itself
    this.default_type('application/json');
    // converting the object literal notation of JavaScript
    // into plain text
    this.end(JSON.stringify(body));
    return;
  }

  // class method: Buffer.isBuffer(obj), return a Boolean value
  this.setHeader('Content-Length', Buffer.isBuffer(body)
    ? body.length : Buffer.byteLength(body, 'utf8'));
  this.end(body);
};

module.exports = extension;
