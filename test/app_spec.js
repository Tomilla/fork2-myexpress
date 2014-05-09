var http = require('http')
  , express = require('../')
  , request = require('supertest')
  , assert = require('chai').assert
  , expect = require('chai').expect;
  //function `express()` shortcut `app` should not declare here

describe("Implement Empty App", function() {
  var app = express()
  describe("as handler to http.createServer", function() {
    it("responds to /foo with 404", function(done) {
      var server = http.createServer(app)
      request(server)
        .get('/foo')
        .expect(404)
        .end(done)
    });
  });

  describe("Defining the app.Listen Method", function () {
    var server;
    var port = 7000;
    before(function(done) {
        server = app.listen(port, done);
    });

    it("should return an http.Server", function () {
      //expect(server).to.be.instanceOf(http.Server);
      assert.instanceOf(server, http.Server);
    });
    it("should responds to /foo with 404", function (done) {
      request("http://localhost:" + port)
        .get("/foo")
        .expect(404)
        .end(done)
    });
  });
});
describe("Implement app.use", function(){
  var app;
  before(function(){
    app = new express();
  })
  var m1 = function(req, res, next){};
  var m2 = function(req, res, next){};
  it("should be able to add middlewares to stack", function () {
  app.use(m1)
  app.use(m2)
  assert.equal(app.stack.length, 2);
  //expect(app.stack.length).to.be.eql(2);
 });
});

describe("Implement calling the middlewares", function () {
  var app;
  // the `beforeEach` keyward will be automatic invoked  when create a new app instance for each test case.
  beforeEach(function(){
    app = new express();
  })
  it("Should be able to call a single middlewares", function (done) {
    var m1 = function(req, res, next) {
      res.end("hello form m1");
    };
    app.use(m1);
    request(app)
      .get("/")
      .expect("hello form m1")
      .end(done)
  })
})
