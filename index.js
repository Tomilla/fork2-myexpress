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
    }
    var myLayer = new MyLayer(path, middleWare);
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
      var layer = stack[index++];
      // all done
      if (!layer) {
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

      try {
        var arity = layer.handle.length;
        if (!layer.match(req.url)) {
          return next(error);
        }
        if (error) {
          if (arity === 4) {
            layer.handle(error, req, res, next);
          } else {
            next(error);
          }
        } else if (arity < 4) {
          layer.handle(req, res, next);
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
