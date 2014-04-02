/* global describe, it */
'use strict';

var should = require('should');
var request = require('supertest');

describe('base functionality', function () {
    it('should create inject from express app', function () {
        var express = require('express');
        var app = express();
        var inject = require('../index.js')(app);

        should.exist(inject);
        inject.should.be.type('function');
    });

    it('should accept only functions', function () {
        var express = require('express');
        var app = express();
        var inject = require('../index.js')(app);

        (function () {
            inject('dependency', 'wow');
        }).should.throwError('inject() requires a function, but got a string');
    });

    it('should not break application with injection', function (done) {
        var express = require('express');
        var app = express();
        var inject = require('../index.js')(app);

        app.get('/', function (req, res) {
            res.send(200);
        });

        inject('dependency', function (req, res, next) {
            next();
        });

        request(app)
            .get('/')
            .expect(200, done);
    });

    it('should inject dependency', function (done) {
        var express = require('express');
        var app = express();
        var inject = require('../index.js')(app);

        inject('dependency', function (req, res, next) {
            next(null, 'injected');
        });

        app.get('/', function (dependency, req, res, next) {
            should.exist(dependency);
            dependency.should.eql('injected');

            should.exist(next);
            next.should.be.type('function');

            res.send(200);
        });

        request(app)
            .get('/')
            .expect(200, done);
    });

    it('should throw on unknown dependency', function (done) {
        var express = require('express');
        var app = express();
        require('../index.js')(app);

        app.get('/', function (wat, req, res, next) {
            next();
        });

        app.use(function (err, req, res, next) {
            res.send(err.toString());

            should.exist(next);
            next.should.be.type('function');
        });

        request(app)
            .get('/')
            .expect(/Unknown dependency: wat/, done);
    });

    it('should resolve dependencies in dependencies', function (done) {
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
            should.exist(dependency);
            dependency.should.eql('dependency injected');

            should.exist(next);
            next.should.be.type('function');

            res.send(200);
        });

        request(app)
        .get('/')
        .expect(200, done);
    });
});
