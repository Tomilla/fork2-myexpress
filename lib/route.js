var methods = require('methods');
methods.push('all');

function makeRoute(verb, handler) {
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
        res.statusCode = 404;
        res.end();
      } else if (req.method == myLayer.verb.toUpperCase()
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
