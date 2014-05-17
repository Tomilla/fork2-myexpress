module.exports = makeRoute;
function makeRoute(verb, handler) {
  if (verb && handler) {
    return function(req, res, next) {
      if (req.method === verb.toUpperCase()) {
        handler(req, res, next);
      } else {
        res.statusCode = 404;
        res.end();
      }
    }
  } else {
    var route = function(req, res, next) {
    };

    route.use = function (verb, handler) {
      var myLayer = {'verb': verb, 'handler': handler};
      this.stack.push(myLayer);
    }
    route.stack = [];
    return route;
  }
}
