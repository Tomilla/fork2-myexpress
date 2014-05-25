var extension = {}
  , http = require('http')
  , mime = require('mime')
  , accepts = require('accepts')
  , crc32 = require('buffer-crc32')
  , fs = require('fs')
  , path = require('path')
  , rparser = require('range-parser');

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

extension.send = function (status, body) {
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
  var contentLength = Buffer.isBuffer(body)
    ? body.length : Buffer.byteLength(body, 'utf8');

  this.setHeader('Content-Length', contentLength);

  // calculate ETag of body
  if (!this.getHeader('ETag') && contentLength
    && this.req.method == 'GET') {
      this.setHeader('ETag', '"' + crc32.unsigned(body) + '"')
  }

  // conditional get with ETag
  var noneMod = this.req.headers["if-none-match"];

  // Conditional get with Last-Modified
  var modSince = this.req.headers["if-modified-since"];
  var lastMod = this.getHeader("Last-Modified");

  if (noneMod == body || lastMod <= modSince) {
    this.statusCode = 304;
  }

  this.end(body);
};

extension.stream = function (someData) {
  var self = this;
  someData.on('data', function (chunk){
    self.send(chunk);
  });
};

extension.sendfile = function (data, options) {
  var self = this;
  if (data.indexOf('..') != -1) {
    self.statusCode = 403;
    self.end();
    return;
  }

  // `Normalize` a string path, avoid getting hurt by boss @hayeah
  // when multiple slashes are found, they're replaced by a single one
  data = !options ? data : path.normalize(options.root) + data;

  // set Content-Type and Content-Length headers
  fs.stat(data, function (error, stat) {
    // exit here since stats will be undefined
    if (error) {
      self.statusCode = 404;
      self.end();
      return;
    }

    if (stat.isDirectory()) {
      self.statusCode = 403;
      self.end();
      return;
    } else if (stat.isFile()) {
      self.setHeader('Content-Size', stat.size);
    }

    var startEnd = {};
    var range = self.req.headers.range;
    //var startEnd = self.rparser(range, stat);

    if (range) {
      r = rparser(stat.size, range)
      if (typeof r != 'number') {
        startEnd = r[0];
        self.statusCode = 206;
        self.setHeader('Content-Range', 'bytes ' + startEnd.start + '-'
          + startEnd.end + '/' + stat.size)
      } else if (r == -1) {
        self.statusCode = 416;
        self.end();
        return;
      }
    }

    var file = fs.createReadStream(data, startEnd);
    self.setHeader('Accept-Range', 'bytes');
    self.setHeader('Content-Type', 'text/plain')
    self.stream(file);
  });
};

/*
extension.rparser = function (range, stat) {
  var startEnd = {};
  var self = this;
  if (range) {
    r = rparser(stat.size, range)
    if (typeof r != 'number') {
      startEnd = r[0];
      self.statusCode = 206;
      self.setHeader('Content-Range', 'bytes ' + startEnd.start + '-'
        + startEnd.end + '/' + stat.size)
    } else if (r == -1) {
      self.statusCode = 416;
      self.end();
      return;
    }
  }
  return startEnd;
}
*/

module.exports = extension;
