var http = require('http')
  , MyLayer = require('./lib/layer');

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
        var subExp = middleWare.stack[0];
        var subMw = subExp.handle;
        var subPath = subExp.layerPath;
        var fullPath = path + subPath;
        var myLayer = new MyLayer(fullPath, subMw);
        myLayer.subPath = subPath;
    } else {
      var myLayer = new MyLayer(path, middleWare);
    }
    this.stack.push(myLayer);
  }

  myexpress.listen = function () {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  }

  myexpress.handle = function(req, res, out) {
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

	    req.params = {};
      if (!myLayer.match(req.url)) {
        return next(error);
      }
      req.params = myLayer.match(req.url).params;
	    if (myLayer.subPath) {
	      req.url = myLayer.subPath;
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
      } catch (event) {
        next(event);
      }
    }
    next();
  };
  return myexpress;
}
module.exports = ohmyexpress;
