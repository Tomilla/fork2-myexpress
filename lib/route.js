var methods = require('methods');
methods.concat('all');

function makeRoute(verb, handler) {
//  if (verb && handler) {
//    return function(req, res, next) {
//      if (req.method === verb.toUpperCase()) {
//        handler(req, res, next);
//      } else {
//        res.statusCode = 404;
//        res.end();
//      }
//    }
//  } else {
  var route = function(req, res, next) {
    route.handle(req, res, next);
  };

  route.stack = [];

  route.handle = function (req, res, out){
    var stack = this.stack
      , index = 0;

    function next(error) {

      if (error == 'route') out();
      if (error) out(error);

      var myLayer = stack[index++];

      if (!myLayer) {
        res.writeHead(404, {
          'content-type': 'text/html'
        });
        res.end();
      }

      if (req.method == myLayer.verb.toUpperCase()
        || myLayer.verb == 'all') {
        myLayer.handler(req, res, next);
      } else {
        next();
      }
    }
    next();
  }

  route.use = function (verb, handler) {
    var myLayer = {'verb': verb, 'handler': handler};
    this.stack.push(myLayer);
  }

  methods.forEach(function(method){
    route[method] = function(handler) {
      route.use(method, handler);
      return this;
    }
  });

  return route;
}

module.exports = makeRoute;
