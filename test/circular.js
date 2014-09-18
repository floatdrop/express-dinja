/* global describe, it */
'use strict';

require('should');
var express = require('express');
var dinja = require('..');

describe('circular dependencies', function () {
    it('should throw on circular dependencies', function () {
        var app = express();
        var inject = dinja(app);
        (function () {
            inject('injected', function (dependency, req, res, next) {
                next(null, 'injected');
            });

            inject('dependency', function (injected, req, res, next) {
                next(null, 'dependency ' + injected);
            });
        }).should.throwError('Cycle found: dependency -> injected');
    });

    it('should not throw on reusing dependencies', function () {
        var app = express();
        var inject = dinja(app);
        (function () {
            inject('cookies', function (req, res, next) {
                next();
            });

            inject('dependency', function (cookies, req, res, next) {
                next();
            });

            inject('pokemon', function (cookies, dependency, req, res, next) {
                next();
            });
        }).should.not.throw();
    });
});
