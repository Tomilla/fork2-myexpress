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

.PHONY: lesson4_t lesson4_m
