all:

server: clean
	NODE_ENV=development supervisor --no-restart-on error -- server.js http://persona-assistant.localhost.chilts.org/ 8080

lint:
	./node_modules/.bin/jshint public/s/js/index.js
	./node_modules/.bin/jshint public/s/js/application.js
	./node_modules/.bin/jshint public/s/js/classic.js

clean:
	find . -name '*~' -delete

.PHONY: clean
