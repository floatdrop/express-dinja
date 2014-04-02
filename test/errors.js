/* global describe, it */
'use strict';

var should = require('should');
var request = require('supertest');

describe('errors handling', function () {

    it('should pass errors from dependencies', function (done) {
        var express = require('express');
        var app = express();
        var inject = require('../index.js')(app);

        inject('bad', function (req, res, next) {
            next('an error');
        });

        app.get('/', function (bad, req, res) {
            should.not.exist(bad);
            res.send(200);
        });

        app.use(function (err, req, res, next) {
            res.send(500, err.toString());

            should.exist(next);
            next.should.be.type('function');
        });

        request(app)
            .get('/')
            .expect(500, 'an error', done);
    });

    it('should pass errors from sub-dependencies', function (done) {
        var express = require('express');
        var app = express();
        var inject = require('../index.js')(app);

        inject('bad', function (req, res, next) {
            next('an error');
        });

        inject('good', function (bad, req, res, next) {
            next();
        });

        app.get('/', function (req, res, good) {
            should.not.exist(good);
            res.send(200);
        });

        app.use(function (err, req, res, next) {
            res.send(500, err.toString());

            should.exist(next);
            next.should.be.type('function');
        });

        request(app)
            .get('/')
            .expect(500, 'an error', done);
    });

});
