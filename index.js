var http = require('http')
  , MyLayer = require('./lib/layer')
  , makeRoute = require('./lib/route')
  , myRequest = require('./lib/request')
  , myResponse = require('./lib/response')
  , myInjector = require('./lib/injector.js')
  , methods = require('methods').concat('all');

function ohmyexpress() {

  function myexpress(req, res, next) {
    myexpress.handle(req, res, next);
  }

  myexpress.stack = [];

  // add the middleware
  myexpress.use = function (path, middleWare, prefix) {
    if (middleWare === undefined) {
      middleWare = path;
      path = '/';
      var myLayer = new MyLayer(path, middleWare);
    } else if (typeof middleWare.handle === "function") {
      var subExp = middleWare.stack[0]  //subset of myexpress
      , subPath = subExp.layerPath      //subset of myexpress layer path
      , subMw = subExp.handle           //subset of myexpress middleware
      , fullPath = path + subPath
      , myLayer = new MyLayer(fullPath, subMw, prefix);
      myLayer.subUrl = subPath;
    } else {
      var myLayer = new MyLayer(path, middleWare, prefix);
    }
    this.stack.push(myLayer);
  };

  methods.forEach(function (method) {
    myexpress[method] = function (path, handler) {
      var route = myexpress.route(path);
        route[method](handler);
      return this;
    }
  });

//  myexpress.get = function (path, handler) {
//    var prefixMatch = true;
//    var func = makeRoute("get", handler);
//    var myLayer = new MyLayer(path, func, prefixMatch);
//    return this.stack.push(myLayer);
//  };

  myexpress.route = function (path) {
    var prefix = true;
    var route = makeRoute();
    myexpress.use(path, route, prefix);
    //var myLayer = new MyLayer(path, route);
    //this.stack.push(myLayer);
    return route;
  };

  myexpress.listen = function () {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  }

  myexpress.handle = function (req, res, out) {
    myexpress.monkey_patch(req, res);
    var stack = this.stack
      , subApp = undefined
      , index = 0;

    req.params = {};  // by default, res.params should be a null {}.

    function next(error) {
      // next callback
      var myLayer = stack[index++];
      if (myLayer) {
        var matchPath = myLayer.match(req.url);
        if (matchPath) {
          req.app = myexpress;
          req.params = matchPath.params;
          var func = myLayer.handle;
          // evaluate mpLayer has subPath property
          // , if exist reset req.url
          req.url = myLayer.subUrl ? myLayer.subUrl : req.url;
        } else {
          return next(error);
        }
      }

      // all done
      if (!func) {
        // delegate to parent
        if (out){
          subApp = myexpress;
          return out(error);
        }

        // exist unhandled error
        if (error) {
          // filter explicit error
          if (error.statusCode == 406) {
              res.writeHead(406, {
                'Content-Type': 'text/html'
              });
              res.end();
          } else {
          // when error is undefined
          // , default statusCode is 500
          res.writeHead(500, {
            'Content-Type': 'text/html'
          });
          res.end();
          }
        // not exist error
        } else {
          res.writeHead(404, {
            'Content-Type': 'text/html'
          });
          res.end();
        }
        return;
      }

      try {
        var arity = func.length;
        if (subApp != undefined) {
          req.app = subApp;
        }
        if (error) {
          if (arity === 4) {
            func(error, req, res, next);
          } else {
            next(error);
          }
        } else if (arity < 4) {
          func(req, res, next);
        } else {
          next();
        }
      } catch (except) {
        next(except);
      }
    }
    next();
  };

  myexpress.monkey_patch = function(req, res) {
    req.__proto__ = myRequest;
    res.__proto__ = myResponse;
    req.res = res;
    res.req = req;
  };

  myexpress._factories = {};

  myexpress.inject = function(_handler) {
    return myInjector(_handler, myexpress)
  };

  myexpress.factory = function(name, func) {
    myexpress._factories[name] = func;
  };

  return myexpress;
}
module.exports = ohmyexpress;
