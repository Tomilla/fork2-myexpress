lesson3:
	mocha test/app_spec.js -R spec -g 'as handler to http.createServer'
	mocha test/app_spec.js -R spec -g 'Defining the app.Listen Method'

lesson4_m: appUse_m callMiddleware_m appEmded_m errorHander_m
appUse_m:
	mocha test/app_spec.js -R spec -g 'Manual implement app.use'
callMiddleware_m:
	mocha test/app_spec.js -R spec -g 'Manual implement calling the middlewares'
appEmbed_m:
	mocha test/app_spec.js -R spec -g 'Manual implement App Embedding As Middleware'
errorHander_m:
	mocha test/app_spec.js -R spec -g 'Manual implement Error Handling'

lesson4_t: appUse_t callMiddleware_t appEmbed_t errorHander_t
appUse_t:
	mocha verify/app_spec.js -R spec -g 'Implement app.use'
callMiddleware_t:
	mocha verify/app_spec.js -R spec -g 'Implement calling the middlewares'
appEmbed_t:
	mocha verify/app_spec.js -R spec -g 'Implement App Embedding As Middleware'
errorHander_t:
	mocha verify/app_spec.js -R spec -g 'Implement Error Handling'

.PHONY: lesson4_t
