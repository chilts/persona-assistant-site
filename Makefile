all:

server: clean
	NODE_ENV=development supervisor --no-restart-on error -- server.js http://persona-assistant.localhost.chilts.org/ 8080

clean:
	find . -name '*~' -delete

.PHONY: clean
