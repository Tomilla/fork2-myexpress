var http = require('http');
var extension = {};
extension.isExpress = true;
extension.__proto__ = http.ServerResponse.prototype;

module.exports = extension;
