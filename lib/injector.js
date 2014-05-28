module.exports = function(handler, app) {
  var injector = function(req, res, next) {
  }

  this._handler = handler;
  this._app = app;

  injector.getParameters = (function () {
    var fnText = this._handler.toString();

    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m
      , FN_ARG_SPLIT = /,/
      , FN_ARG = /^\s*(_?)(\S+?)\1\s*$/
      , STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    // in this case, `inject` is a container that remain param
    var params = [];
    var argDecl = fnText.replace(STRIP_COMMENTS, '').match(FN_ARGS);

    argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg) {
      arg.replace(FN_ARG, function(all, underscore, name) {
        params.push(name);
      });
    });

    return params;
  })();

  injector.extract_params = function() {
    return this.getParameters;
  }

  injector.dependencies_loader = function() {
    var values = []
      , error = undefined
      , params = this.getParameters;

    return function(_depInject) {
      params.forEach(function(elem) {
        return function() {
          try {
            this._app._factories[elem](null, null, function(err, val) {
              values.push(val);
            });
          } catch (_except) {
            error = _except;
          }

          if (error) return false;
          else return true;
        }();
      });
      _depInject(error, values);
    }
  }
  return injector;
}
