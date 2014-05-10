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
    var mw_1st = function (req, res, next) {
      next();
    };
    var mw_2nd = function (req, res, next) {
      res.end("hello from second middleware");
    };
    app.use(mw_1st);
    app.use(mw_2nd);
    request(app)
      .get('/')
      .expect("hello from second middleware")
      .end(okay)
  });
  it("Should set `404` at the end of middleware chain", function (okay) {
    var mw_1st = function (req, res, next) {
      next();
    };
    var mw_2nd = function (req, res, next) {
     next();
    };
    app.use(mw_1st);
    app.use(mw_2nd);
    request(app)
      .get('/')
      .expect(404)
      .end(okay)
  });
  it("Should set `404` if no middleware is add", function (okay) {
    app.stack;
    request(app)
      .get('/')
      .expect(404)
      .end(okay)
  });
});
describe("Manual implement Error Handling", function () {
  var app;
  beforeEach(function () {
    app = new express();
  });
  it("Should return 500 for uncaution", function (okay) {
    var mw_1st = function (req, res, next) {
      next(new Error("You found a ton of TNT, GAME OVER"));
    };
    app.use(mw_1st);
    request(app)
      .get('/')
      .expect(500)
      .end(okay)
  });
  it("Should return for uncaught error", function (okay) {
    var mw_1st = function (req, res, next) {
      //raise new Error("You found a ton of TNT, GAME OVER");
      throw new Error(", GAME OVER");
    };
    app.use(mw_1st);
    request(app)
      .get('/')
      .expect(500)
      .end(okay)
  });
  it("Should skip error handlers when next is called without an error"
  , function(okay) {
    var mw_1st = function (req, res, next) {
      next();
    };
    var event_1st = function (err, req, res, next) {
      //timeout
    };
    var mw_2nd = function (req, res, next) {
      res.end("second middleware");
    };
    app.use(mw_1st);
    app.use(event_1st);     // should skip this. will timeout if called
    app.use(mw_2nd);
    request(app)
      .get('/')
      .expect('second middleware')
      .end(okay)
  });
  it("Should skip normal middlewares if next is called with an error"
   , function (okay) {
   var mw_1st = function (req, res, next) {
     next(new Error('NO ZUO NO DIE, GAME OVER'));
   };
   var mw_2nd = function (req, res, next) {
     //timeout
   };
   var event_1st = function (err, req, res, next) {
     res.end('first event');
   };
   app.use(mw_1st);
   app.use(mw_2nd);     // timeout of 2000ms exceeded
   app.use(event_1st);
   request(app)
     .get('/')
     .expect('first event')
     .end(okay)
  });
});

describe("Manual implement App Embedding As Middleware", function () {
  var app, subApp;
  beforeEach(function () {
    app = new express();
    subApp = new express();
  })
  it("Should pass unhandled request to parent", function (okay) {
    function mw_2nd (req, res, next) {
      res.end('second middleware');
    }
    app.use(subApp);
    app.use(mw_2nd);
    request(app)
      .get('/')
      .expect('second middleware')
      .end(okay)
  });
  it("Should pass unhandled error to parent", function (okay) {
    function mw_1st(req, res, next) {
      next("first middleware error");
    }
    function event_1st(err, req, res, next) {
      res.end(err);
    }
    subApp.use(mw_1st);
    app.use(subApp);
    app.use(event_1st);
    request(app)
      .get('/')
      .expect('first middleware error')
      .end(okay)
  });
});
