var http = require('http');
var extension = {};
extension.isExpress = true;
extension.__proto__ = http.IncomingMessage.prototype;

module.exports = extension;
