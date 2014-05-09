var http = require('http')
  , express = require('../')
  , request = require('supertest')
  , assert = require('chai').assert
  , expect = require('chai').expect;
  //function `express()` shortcut `app` should not declare here

describe("Implement Empty App", function() {
  var app = express()
  describe("as handler to http.createServer", function() {
    it("responds to /foo with 404", function(okay) {
      var server = http.createServer(app)
      request(server)
        .get('/foo')
        .expect(404)
        .end(okay)
    });
  });

  describe("Defining the app.Listen Method", function () {
    var server;
    var port = 7000;
    before(function(okay) {
        server = app.listen(port, okay);
    });

    it("should return an http.Server", function () {
      //expect(server).to.be.instanceOf(http.Server);
      assert.instanceOf(server, http.Server);
    });
    it("should responds to /foo with 404", function (okay) {
      request("http://localhost:" + port)
        .get("/foo")
        .expect(404)
        .end(okay)
    });
  });
});
describe("Manual implement app.use", function(){
  var app;
  beforeEach(function(){
    app = new express();
  })
  var mw_1st = function(req, res, next){};
  var mw_2nd = function(req, res, next){};
  it("should be able to add middlewares to stack", function () {
  app.use(mw_1st)
  app.use(mw_2nd)
  assert.equal(app.stack.length, 2);
  //expect(app.stack.length).to.be.eql(2);
 });
});

describe("Manual implement calling the middlewares", function () {
  var app;
  // the `beforeEach` keyward will be automatic invoked  when create a new app instance for each test case.
  beforeEach(function(){
    app = new express();
  })
  it("Should be able to call a single middlewares", function (okay) {
    var mw_1st = function(req, res, next) {
      res.end("hello form first middleware");
    };
    app.use(mw_1st);
    request(app)
      .get("/")
      .expect("hello form first middleware")
      .end(okay)
  });
  it("Should be able to call `next` to go to the next middleware"
    , function(okay) {
    var mw_1st = function(req, res, next) {
      next();
    };
    var mw_2nd = function(req, res, next) {
      res.end("hello from second middleware");
    };
    app.use(mw_1st);
    app.use(mw_2nd);
    request(app)
      .get('/')
      .expect("hello from second middleware")
      .end(okay)
  });
  it("Should set `404` at the end of middleware chain", function(okay) {
    var mw_1st = function(req, res, next) {
      next();
    };
    var mw_2nd = function(req, res, next) {
     next();
    };
    app.use(mw_1st);
    app.use(mw_2nd);
    request(app)
      .get('/')
      .expect(404)
      .end(okay)
  });
  it("Should set `404` if no middleware is add", function(okay) {
    app.stack;
    request(app)
      .get('/')
      .expect(404)
      .end(okay)
  })
});
