var http = require( "http");

function myexpress() {
  var app;
  app = function( req, res ) {
    if ( req.url == '/foo' ) {
      res.statusCode = 404;
      res.end();
    }
  }
  app.listen = function( port, done ) {
    var server = http.createServer( app );
    port = port || 4000;
    return server.listen( port, function(){
      done();
    })
  }
  return app;
}

module.exports = myexpress;
