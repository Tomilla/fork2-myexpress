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

describe("Layer class and the match method",function() {
  var layer, fn;
  beforeEach(function() {
    var Layer = require("../lib/layer");
    fn = function() {};
    layer = new Layer("/foo",fn);
  });

  it("sets layer.handle to be the middleware",function() {
    expect(layer.handle).to.eql(fn);
  });

  it("returns undefined if path doesn't match",function() {
    expect(layer.match("/bar")).to.be.undefined;
  });

  it("returns matched path if layer matches the request path exactly",function() {
    var match = layer.match("/foo");
    expect(match).to.not.be.undefined;
    expect(match).to.have.property("path","/foo");
  });

  it("returns matched prefix if the layer matches the prefix of the request path",function() {
    var match = layer.match("/foo/bar");
    expect(match).to.not.be.undefined;
    expect(match).to.have.property("path","/foo");
  });
});

describe("app.use should add a Layer to stack",function() {
  var app, Layer;
  beforeEach(function() {
    app = express();
    Layer = require("../lib/layer");
    app.use(function() {});
    app.use("/foo",function() {});
  });

  it("first layer's path should be /",function() {
    layer = app.stack[0];
    expect(layer.match("/foo")).to.not.be.undefined;
  });

  it("second layer's path should be /foo",function() {
    layer = app.stack[1];
    expect(layer.match("/")).to.be.undefined;
    expect(layer.match("/foo")).to.not.be.undefined;
  });
});

describe("The middlewares called should match request path:",function() {
  var app;
  before(function() {
    app = express();
    app.use("/foo",function(req,res,next) {
      res.end("foo");
    });

    app.use("/",function(req,res) {
      res.end("root");
    });
  });

  it("returns root for GET /",function(done) {
    request(app).get("/").expect("root").end(done);
  });

  it("returns foo for GET /foo",function(done) {
    request(app).get("/foo").expect("foo").end(done);
  });

  it("returns foo for GET /foo/bar",function(done) {
    request(app).get("/foo/bar").expect("foo").end(done);
  });
});

describe("The error handlers called should match request path:",function() {
  var app;
  before(function() {
    app = express();
    app.use("/foo",function(req,res,next) {
      throw "boom!"
    });

    app.use("/foo/a",function(err,req,res,next) {
      res.end("error handled /foo/a");
    });

    app.use("/foo/b",function(err,req,res,next) {
      res.end("error handled /foo/b");
    });
  });

  it("handles error with /foo/a",function(done) {
    request(app).get("/foo/a").expect("error handled /foo/a").end(done);
  });

  it("handles error with /foo/b",function(done) {
    request(app).get("/foo/b").expect("error handled /foo/b").end(done);
  });

  it("returns 500 for /foo",function(done) {
    request(app).get("/foo").expect(500).end(done);
  });
});

describe("Path parameters extraction",function() {
  var Layer, layer;

  before(function() {
    Layer = require("../lib/layer");
    layer = new Layer("/foo/:a/:b");
  });

  it("returns undefined for unmatched path",function() {
    expect(layer.match("/bar")).to.be.undefined;
  });

  it("returns undefined if there isn't enough parameters",function() {
    expect(layer.match("/foo/apple")).to.be.undefined;
  });

  it("returns match data for exact match",function() {
    var match = layer.match("/foo/apple/xiaomi");
    expect(match).to.not.be.undefined;
    expect(match).to.have.property("path","/foo/apple/xiaomi");
    expect(match.params).to.deep.equal({a: "apple", b: "xiaomi"});
  });

  it("returns match data for prefix match",function() {
    var match = layer.match("/foo/apple/xiaomi/htc");
    expect(match).to.not.be.undefined;
    expect(match).to.have.property("path","/foo/apple/xiaomi");
    expect(match.params).to.deep.equal({a: "apple", b: "xiaomi"});
  });

  it("should decode uri encoding",function() {
    var match = layer.match("/foo/apple/xiao%20mi");
    expect(match.params).to.deep.equal({a: "apple", b: "xiao mi"});
  });

  it("should strip trialing slash",function() {
    layer = new Layer("/")
    expect(layer.match("/foo")).to.not.be.undefined;
    expect(layer.match("/")).to.not.be.undefined;

    layer = new Layer("/foo/")
    expect(layer.match("/foo")).to.not.be.undefined;
    expect(layer.match("/foo/")).to.not.be.undefined;
  });
});

describe("Implement req.params",function() {
  var app;
  before(function() {
    app = express();
    app.use("/foo/:a",function(req,res,next) {
      res.end(req.params.a);
    });

    app.use("/foo",function(req,res,next) {
      res.end(""+req.params.a);
    });
  });

  it("should make path parameters accessible in req.params",function(done) {
    request(app).get("/foo/google").expect("google").end(done);
  })

  it("should make {} the default for req.params",function(done) {
    request(app).get("/foo").expect("undefined").end(done);
  });
})

describe("app should have the handle method",function() {
  it("should have the handle method",function() {
    var app = express();
    expect(app.handle).to.be.a("function");
  });
});

describe("Prefix path trimming",function() {
  var app, subapp, barapp;
  beforeEach(function() {
    app = express();
    subapp = express();

    subapp.use("/bar",function(req,res) {
      res.end("embedded app: "+req.url);
    });

    app.use("/foo",subapp);

    app.use("/foo",function(req,res) {
      res.end("handler: "+req.url);
    });
  });

  it("trims request path prefix when calling embedded app",function(done) {
    request(app).get("/foo/bar").expect("embedded app: /bar").end(done);
  });

  it("restore trimmed request path to original when going to the next middleware",function(done) {
    request(app).get("/foo").expect("handler: /foo").end(done);
  });

  describe("ensures leading slash",function() {
    beforeEach(function() {
      barapp = express();
      barapp.use("/",function(req,res) {
        res.end("/bar");
      });
      app.use("/bar",barapp);
    });

    it("ensures that first char is / for trimmed path",function(done) {
      // request(app).get("/bar").expect("/bar").end(done);
      request(app).get("/bar/").expect("/bar").end(done);
    });
  });
});
