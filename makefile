testServer:
	mocha test/app_spec.js -R spec -g 'as handler to http.createServer'
	mocha test/app_spec.js -R spec -g 'Defining the app.Listen Method'
.PHONY: testServer
