lesson3:
	mocha test/app_spec.js -R spec -g 'as handler to http.createServer'
	mocha test/app_spec.js -R spec -g 'Defining the app.Listen Method'

lesson4_m: appUse_m callMiddleware_m errorHander_m appEmbed_m
appUse_m:
	mocha test/app_spec.js -R spec -g 'Manual implement app.use'
callMiddleware_m:
	mocha test/app_spec.js -R spec -g 'Manual implement calling the middlewares'
errorHander_m:
	mocha test/app_spec.js -R spec -g 'Manual implement Error Handling'
appEmbed_m:
	mocha test/app_spec.js -R spec -g 'Manual implement App Embedding As Middleware'

lesson4_t: appUse_t callMiddleware_t errorHander_t appEmbed_t
appUse_t:
	mocha verify/app_spec.js -R spec -g 'Implement app.use'
callMiddleware_t:
	mocha verify/app_spec.js -R spec -g 'Implement calling the middlewares'
errorHander_t:
	mocha verify/app_spec.js -R spec -g 'Implement Error Handling'
appEmbed_t:
	mocha verify/app_spec.js -R spec -g 'Implement App Embedding As Middleware'

lesson5_t: layerAndMatch_t layer2Stack_t MWCmatchRequestPath_t EHCmatchRequestPath_t
layerAndMatch_t:
	mocha verify/app_spec.js -R spec -g 'Layer class and the match method'
layer2Stack_t:
	mocha verify/app_spec.js -R spec -g 'app.use should add a Layer to stack'
MWCmatchRequestPath_t:
	mocha verify/app_spec.js -R spec -g 'The middlewares called should match request path'
EHCmatchRequestPath_t:
	mocha verify/app_spec.js -R spec -g 'The error handlers called should match request path'

lesson6_t: pathParameter_t req.params_t haveHandleMethod_t prePathTrim_t
pathParameter_t:
	mocha verify/app_spec.js -R spec -g 'Path parameters extraction'
req.params_t:
	mocha verify/app_spec.js -R spec -g 'Implement req.params'
haveHandleMethod_t:
	mocha verify/app_spec.js -R spec -g 'app should have the handle method'
prePathTrim_t:
	mocha verify/app_spec.js -R spec -g 'Prefix path trimming'

lesson7_t: GET_t allHttpVerbs_t
GET_t:
	mocha verify/verbs_spec.js -R spec -g 'App get method'
allHttpVerbs_t:
	mocha verify/verbs_spec.js -R spec -g 'All http verbs'

lesson8_t:
	mocha verify/route_spec.js -R spec -g 'Add handlers to a route'
	mocha verify/route_spec.js -R spec -g 'Implement Route Handlers Invokation'
	mocha verify/route_spec.js -R spec -g 'Implement Verbs For Route'
	mocha verify/route_spec.js -R spec -g 'Implement app.route'
	mocha verify/route_spec.js -R spec -g 'Implement Verbs For App'

lesson9_t:
	mocha verify/monkey_spec.js -R spec -g "Monkey patch before serving"
	mocha verify/monkey_spec.js -R spec -g "Setting req.app"

.PHONY: lesson4_t lesson4_m lesson5_t lesson7_t lesson8_t
