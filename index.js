function myexpress() {
  function responseFrom( req, res ) {
    if ( req.url == '/foo' ) {
      res.statusCode = 404;
      res.end();
    }
  }

  var http = require( "http");
  var server = http.createServer(responseFrom);
  responseFrom.listen = function( port, done ) {
    return server.listen( port, function() {
      done();
    })
  }
  return responseFrom;
}
module.exports = myexpress;
