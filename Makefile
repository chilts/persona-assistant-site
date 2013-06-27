all:

server: clean
	ENVIRONMENT=development node server.js http://persona-assistant.localhost.chilts.org/

clean:
	find . -name '*~' -delete

.PHONY: clean
