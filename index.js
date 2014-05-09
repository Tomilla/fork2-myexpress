var http = require('http');

function ohmyexpress() {
  function myexpress(req, res, next) {
  };
  myexpress.stack = [];

  // add the middleware
  myexpress.use = function (middleWare) {
    this.stack.push(middleWare)
  }

  myexpress.listen = function () {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments)
  }
  return myexpress;
}
module.exports = ohmyexpress;
