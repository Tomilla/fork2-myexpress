var http = require( "http" )
  , express = require( "../" )
  , request = require( "supertest")
  , assert = require( "chai" ).assert;
  //function `express()` shortcut `app` should not declare here

describe( "Implement Empty App", function() {
  var app = express()
  describe( "as handler to http.createServer", function() {
    it ("responds to /foo with 404", function( done ) {
      var server = http.createServer( app )
      request( server )
        .get( '/foo' )
        .expect( 404 )
        .end( done )
    });
  });

  describe( "Defining the app.Listen Method", function() {
    var server;
    var port = 7000;
    before(function( done ) {
        server = app.listen( port, done );
    });

    it ( "should return an http.Server", function() {
      //expect(server).to.be.instanceOf(http.Server);
      assert.instanceOf(server, http.Server);
    });
    it ( "should responds to /foo with 404", function( done ) {
      request( "http://localhost:" + port )
        .get( "/foo" )
        .expect( 404 )
        .end( done )
    });
  });
});
