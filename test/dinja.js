/* global describe, it */
'use strict';

var should = require('should');
var request = require('supertest');

describe('inject', function () {
    it('should create inject from express app', function () {
        var express = require('express');
        var app = express();
        var inject = require('../index.js')(app);

        should.exist(inject);
        inject.should.be.type('function');
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

    it('should not break application with late injection', function (done) {
        var express = require('express');
        var app = express();
        app.get('/', function (req, res) {
            res.send(200);
        });

        var inject = require('../index.js')(app);

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
        app.get('/', function (dependency, req, res, next) {
            should.exist(dependency);
            dependency.should.eql('injected');

            should.exist(next);
            next.should.be.type('function');

            res.send(200);
        });

        var inject = require('../index.js')(app);

        inject('dependency', function (req, res, next) {
            next(null, 'injected');
        });

        request(app)
            .get('/')
            .expect(200, done);
    });

    it('should throw on unknown dependency', function (done) {
        var express = require('express');
        var app = express();
        app.get('/', function (wat, req, res, next) {
            next();
        });

        var inject = require('../index.js')(app);

        inject('dependency', function (req, res, next) {
            next(null, 'injected');
        });

        request(app)
            .get('/')
            .end(function (err) {
                should.exist(err);
                err.should.be.a.Error(/Unknow dependency: wat/);
                done();
            }.should.not.throw());
    });

    it('should resolve dependencies in dependencies', function (done) {
        var express = require('express');
        var app = express();
        app.get('/', function (father, req, res, next) {
            should.exist(father);
            father.should.eql('father injected');

            should.exist(next);
            next.should.be.type('function');

            res.send(200);
        });

        var inject = require('../index.js')(app);

        inject('dependency', function (req, res, next) {
            next(null, 'injected');
        });

        inject('father', function (dependency, req, res, next) {
            next(null, 'father ' + dependency);
        });

        request(app)
            .get('/')
            .expect(200, done);
    });
});
