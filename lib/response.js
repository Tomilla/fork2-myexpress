var http = require('http')
  , mime = require('mime')
  , extension = {};
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


module.exports = extension;
