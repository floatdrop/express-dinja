/* global describe, it */
'use strict';

var should = require('should');
var request = require('supertest');
var express = require('express');
var dinja = require('..');

describe('base functionality', function () {
    it('should create inject from express app', function () {
        var app = express();
        var inject = dinja(app);

        should.exist(inject);
        inject.should.be.type('function');
    });

    it('should accept only functions', function () {
        var app = express();
        var inject = dinja(app);

        (function () {
            inject('dependency', 'wow');
        }).should.throwError('inject() requires a function, but got a string');
    });

    it('should not break application with injection', function (done) {
        var app = express();
        var inject = dinja(app);

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

    it('should inject one dependency', function (done) {
        var app = express();
        var inject = dinja(app);

        inject('dependency', function (req, res, next) {
            next(null, 'injected');
        });

        app.get('/', function (dependency, req, res, next) {
            should.exist(dependency);
            dependency.should.eql('injected');

            should.exist(next);
            next.should.be.type('function');

            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect(200, done);
    });

    it('should inject multiple dependencies', function (done) {
        var app = express();
        var inject = dinja(app);

        inject('dependency1', function (req, res, next) {
            setTimeout(next, 10, null, 'injected1');
        });

        inject('dependency2', function (req, res, next) {
            setTimeout(next, 10, null, 'injected2');
        });

        app.get('/', function (dependency1, dependency2, req, res, next) {
            should.exist(dependency1);
            dependency1.should.eql('injected1');

            should.exist(dependency2);
            dependency2.should.eql('injected2');

            should.exist(next);
            next.should.be.type('function');

            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect(200, done);
    });

    it('should throw on unknown dependency', function (done) {
        var app = express();
        dinja(app);

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
        var app = express();
        var inject = dinja(app);

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
