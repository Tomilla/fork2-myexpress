module.exports = createInjector;

function createInjector(handler, app) {
  var injector = function (req, res, next) {
    var _depInject = function (errors, values) {
      if (errors) {
        next(errors);
        return false;
      }
      injector._handler.apply(this, values);
    };
    injector.dependencies_loader(req, res, next)(_depInject);
  };

  injector._handler = handler;
  injector._app = app;

  injector.extract_params = function () {
    return this.getParameters(this._handler);
  };

  injector.getParameters = function (fn) {
    var fnText = fn.toString();
    var FN_ARGS        = /^function\s*[^\(]*\(\s*([^\)]*)\)/m
      , FN_ARG_SPLIT   = /,/
      , FN_ARG         = /^\s*(_?)(\S+?)\1\s*$/
      , STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    // in this case, `inject` is a container that remain params
    var params = [];
    var argDecl = fnText.replace(STRIP_COMMENTS, '').match(FN_ARGS);
    argDecl[1].split(FN_ARG_SPLIT).forEach(function (arg) {
      arg.replace(FN_ARG, function (all, underscore, name) {
        params.push(name);
      });
    });

    return params;
  };

  injector.dependencies_loader = function (req, res, out) {
    var argDict = {0: 'req', 1: 'res', 2: 'next'}
      , appFact = this._app._factories
      , params = this.extract_params()
      , offset = params.length
      , errors = undefined
      , values = [];

    for (var idx = 0; idx < Object.keys(argDict).length; idx++) {
      if (!arguments[idx]) continue;
      appFact[argDict[idx]] =  arguments[idx];
    }

    var next = function (innerErr, innerVal) {
      while (--offset >= 0) {
        var innerElem = params[offset];
        try {
          if (appFact[innerElem]) {
            if (typeof appFact[innerElem] === 'function') {
              appFact[innerElem](req, res, next);
            }
            else {
              next('', appFact[innerElem]);
            }
          } else {
            var prompt = new Error("Factory not defined: " + innerElem);
            throw prompt;
          }
        } catch(_except) {
          errors = _except;
        }
      }

      if (innerErr) errors = innerErr;
      if (innerVal) values.push(innerVal);
    };

    next();

    return function (_depInject) {
      _depInject(errors, values);
    };
  };

  return injector;
};
