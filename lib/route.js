var methods = require('methods');
methods.push('all');

function makeRoute() {
  var route = function(req, res, next) {
    route.handler(req, res, next);
  };

  route.stack = [];

  route.use = function (verb, handler) {
    var myLayer = {'verb': verb, 'handler': handler};
    this.stack.push(myLayer);
  }

  route.handler = function(req,res,out) {
    var index = 0;
    var stack = this.stack;

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

  methods.forEach(function(method){
    route[method] = function(handler) {
      route.use(method, handler);
      return this;
    }
  });

  return route;
}

module.exports = makeRoute;
