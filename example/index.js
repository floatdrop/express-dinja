'use strict';

var express = require('express');
var app = express();
var inject = require('../index.js')(app);

inject('injected', function (req, res, next) {
    next(null, 'injected');
});

inject('dependency', function (injected, req, res, next) {
    next(null, 'dependency ' + injected);
});

app.get('/', function (dependency, req, res, next) {
    res.json({
        dinja: dependency
    });
});

require('http').createServer(app).listen(8080);
