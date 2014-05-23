var http = require('http');
var mime = require('mime');
var accepts = require('accepts');
//var crc32 = require('buffer-crc32');

var proto = {};
proto.isExpress = true;
proto.__proto__ = http.ServerResponse.prototype

proto.redirect = function(code,path){
  var body = '';
  if(typeof code == 'string'){
    url = code;
    this.setHeader('Location', url);
    this.statusCode = 302;
    body = '';
  } else {
    this.setHeader('Location', path);
    this.statusCode = code;
    body = '301 - Moved Permanently';
  }
  this.setHeader('Content-Length',body.length);
  this.end(body ? null :body);
};

proto.type = function(ext){
  this.setHeader('Content-Type',mime.lookup(ext));  
}

proto.default_type = function(ext){
  if(!this.getHeader('Content-Type'))
  this.setHeader('Content-Type',mime.lookup(ext));
}

proto.format = function(dict){
  var accept = accepts(this.req);
  var array = Object.keys(dict);
  var type = accept.types(array);
  if(type.length){
    this.type(type);
    dict[type]();
  } else {
    var err = new Error("Not Acceptable");
    err.statusCode = 406;
    throw err;
  } 
}

module.exports = proto;
