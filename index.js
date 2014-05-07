var express = require( "express" )
  , http = require( "http")
  , app = express();

function myexpress() {
app.use( function(req, res, next ) {
  if ( req.url == '/foo' ) {
    res.statusCode = 404;
    res.end();
  }
});
app.listen(4000);
return app;
}

module.exports = myexpress;
