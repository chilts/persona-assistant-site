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
var verify = require('browserid-verify')();

process.title = 'persona-assistant.chilts.org';

// ----------------------------------------------------------------------------
// some globals

// set the audience from the arg passed in
var audience = process.argv[2];
var port     = process.argv[3] || 8080;

// create the logger (for stdout)
var log = log2();

// ----------------------------------------------------------------------------
// create the express app and add middleware and routes

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// configure some app vars
app.use(function(req, res, next) {
    if ( process.env.NODE_ENV === 'development' ) {
        app.locals.pretty = true;
    }
    app.locals.env = process.env.NODE_ENV;
    next();
});

var oneDay = 24 * 60 * 60 * 1000; // 86400000
app.use(express.static(__dirname + '/public', { maxAge: oneDay }));

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.cookieParser(passgen.create(16)));
app.use(express.cookieSession({
    secret : passgen.create(16)
}));

app.use(function(req, res, next) {
    res.locals.email = req.session.email || '';
    next();
});

// ----------------------------------------------------------------------------
// the router

app.get('/', function(req, res) {
    log('GET /: entry');
    res.render('index.jade');
});

app.get('/classic', function(req, res) {
    log('GET /classic: entry');
    res.render('classic.jade');
});

app.get('/application', function(req, res) {
    log('GET /application: entry');
    res.render('application.jade');
});

app.get('/api', function(req, res) {
    log('GET /api: entry');
    res.render('api.jade');
});

app.post('/login', function(req, res) {
    log('POST /login: entry');
    res.redirect('/login.json');
});

app.post('/login.json', function(req, res) {
    log('POST /login.json: entry');

    var assertion = req.body.assertion;
    verify(assertion, audience, function(err, email, response) {
        console.log('(err,email,response)=', err, email, response);
        if (err) {
            req.session = null;
            log2('err=' + err);
            res.json({ ok : false, msg : 'There was an error with the request to the verifier.' });
            return;
        }

        log2('verifier response = ' + JSON.stringify(response));

        // now we need to check if the response was okay
        if ( !email ) {
            req.session = null;
            res.json({ ok : false, msg : response.reason });
            return;
        }

        // all looks ok, so log the user in, save the email to the session
        req.session.email = email;
        res.json({ ok : true, msg : 'Assertion Verified.', email : email });
    });
});

app.get('/logout', function(req, res) {
    log('GET /logout: entry');
    req.session = null;
    res.redirect('/classic');
});

app.get('/logout.json', function(req, res) {
    log('GET /logout.json: entry');
    req.session.email = '';
    req.session = null;
    res.json({ ok : true });
});

app.post('/logout.json', function(req, res) {
    log('POST /logout.json: entry');
    req.session = null;
    res.json({ ok : true });
});

// ----------------------------------------------------------------------------
// start the server

var server = http.createServer(app);
server.listen(port, function() {
    log('Server listening on port ' + port);
});

// ----------------------------------------------------------------------------
