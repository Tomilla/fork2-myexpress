var http = require('http');
var proto = {};
proto.isExpress = true;
proto.redirect = function(code, url) {
    if (!url) {
        url = code;
        code = 302;
    }
    this.writeHead(code, {
        'Location': url,
        'Content-Length': 0
    });
    this.end();
};
proto.__proto__ = http.ServerResponse.prototype;
module.exports = proto;
