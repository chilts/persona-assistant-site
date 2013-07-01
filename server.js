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
app.configure('development', function(){
    app.locals.pretty = true;
});

// app.use(express.logger());

var oneDay = 24 * 60 * 60 * 1000; // 86400000
app.use(express.static(__dirname + '/public', { maxAge: oneDay }));

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

    // curl -d "assertion=<ASSERTION>&audience=https://example.com:443" "https://verifier.login.persona.org/verify"
    request
        .post('https://verifier.login.persona.org/verify')
        .send({ assertion : assertion, audience : audience })
        .end(function(err, result) {
            var body = result.res.body;
            if ( body.status === 'okay' ) {
                // save the email to the session
                log2('body.status=okay : ' + JSON.stringify(body));
                req.session.email = body.email;
                res.json({ ok : true, email : 'andychilton@gmail.com' });
            }
            else {
                req.session = null;
                log2('reason=' + body.reason);
                res.json({ ok : false, msg : body.reason });
            }
        })
    ;
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
var port = 8080;
server.listen(port, function() {
    log('Server listening on port ' + port);
});

// ----------------------------------------------------------------------------
