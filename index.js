var http = require('http');

function ohmyexpress() {
  function myexpress(req, res, next) {
    myexpress.handle(req, res, next)
  };

  myexpress.stack = [];

  // add the middleware
  myexpress.use = function (middleWare) {
    this.stack.push(middleWare)
  }

  myexpress.listen = function () {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments)
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
        var arity = layer.length;
        if (error) {
          if (arity === 4) {
            layer(error, req, res, next);
          } else {
            next(error);
          }
        } else if (arity < 4) {
          layer(req, res, next);
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
