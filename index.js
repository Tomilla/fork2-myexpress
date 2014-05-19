var http = require('http')
  , MyLayer = require('./lib/layer')
  , makeRoute = require('./lib/route')
  , myRequest = require('./lib/request')
  , myResponse = require('./lib/response')
  , methods = require('methods');
methods.concat('all');

function ohmyexpress() {

  function myexpress(req, res, next) {
    myexpress.handle(req, res, next);
  }

  myexpress.stack = [];

  // add the middleware
  myexpress.use = function (path, middleWare) {
    if (middleWare === undefined) {
      middleWare = path;
      path = '/';
      var myLayer = new MyLayer(path, middleWare);
    } else if (typeof middleWare.handle === "function") {
      var subExp = middleWare.stack[0]  //subset of myexpress
      , subPath = subExp.layerPath      //subset of myexpress layer path
      , subMw = subExp.handle           //subset of myexpress middleware
      , fullPath = path + subPath
      , myLayer = new MyLayer(fullPath, subMw);
      myLayer.subPath = subPath;
    } else {
      var myLayer = new MyLayer(path, middleWare);
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
    var route = makeRoute();
    myexpress.use(path, route);
//    var myLayer = new MyLayer(path, route);
//    this.stack.push(myLayer);
    return route;
  };

  myexpress.listen = function () {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  }

  myexpress.handle = function (req, res, out) {
    var stack = this.stack
      , index = 0;

    function next(error) {
      // next callback
      var myLayer = stack[index++];
      // all done
      if (!myLayer) {
        // delegate to parent
        if (out) return out(error);
        // unhandled error
        if (error) {
          // default to 500
          res.writeHead(500, {
            'Content-Type': 'text/html'
          });
          res.end();
        } else {
          res.writeHead(404, {
            'Content-Type': 'text/html'
          });
          res.end();
        }
        return;
      }

      req.params = {};  // by default, res.params should be a null {}.
      var matchPath = myLayer.match(req.url);
      if (matchPath) {
        req.params = matchPath.params;
        // evaluate mpLayer has subPath property, if exist reset req.url
        req.url = myLayer.subPath ? myLayer.subPath : req.url;
      } else {
        return next(error);
      }

      try {
        var arity = myLayer.handle.length;
        if (error) {
          if (arity === 4) {
            myLayer.handle(error, req, res, next);
          } else {
            next(error);
          }
        } else if (arity < 4) {
          myLayer.handle(req, res, next);
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
    res.__prote__ = myResponse;
  };

  return myexpress;
}
module.exports = ohmyexpress;
