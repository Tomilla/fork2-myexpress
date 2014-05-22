var http = require('http');
var extension = {};
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

module.exports = extension;
