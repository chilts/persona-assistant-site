// ----------------------------------------------------------------------------
//
// persona.chilts.org - Example site which uses jquery.personaAssistant.js
//
// Copyright (c) 2013 Andrew Chilton
// * email : andychilton@gmail.com
// * site  : http://chilts.org/blog
//
// ----------------------------------------------------------------------------

// core
var http = require('http');

// npm
var express = require('express');
var passgen = require('passgen');
var request = require('superagent');
var log2 = require('log2');

// ----------------------------------------------------------------------------
// some globals

// set the audience from the arg passed in
var audience = process.argv[2];

// create the logger (for stdout)
var log = log2();

// ----------------------------------------------------------------------------
// create the express app and add middleware and routes

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.logger());

app.use(express.static(__dirname + '/public'));

app.use(express.bodyParser());

app.use(express.cookieParser(passgen.create(16)));

app.use(express.cookieSession({
    secret : passgen.create(16)
}));

app.use(function(req, res, next) {
    res.locals.email = req.session.email || '';
    next();
});

app.get('/', function(req, res) {
    res.render('index.jade');
});

app.post('/login', function(req, res) {

    var assertion = req.body.assertion;

    // curl -d "assertion=<ASSERTION>&audience=https://example.com:443" "https://verifier.login.persona.org/verify"
    log('Got /login');
    request
        .post('https://verifier.login.persona.org/verify')
        .send({ assertion : assertion, audience : audience })
        .end(function(err, result) {
            var body = result.res.body;
            if ( body.status === 'okay' ) {
                // save the email to the session
                req.session.email = body.email;
                res.json({ ok : true, email : 'andychilton@gmail.com' });
            }
            else {
                delete req.session.email;
                res.json({ ok : false, msg : body.reason });
            }
        })
    ;
});

app.post('/logout', function(req, res) {
    req.session = null;
    res.json({ ok : true });
});

// ----------------------------------------------------------------------------
// start the server

var server = http.createServer(app);
var port = 8080;
server.listen(port, function() {
    log('Server listening on port %s', port);
});

// ----------------------------------------------------------------------------
