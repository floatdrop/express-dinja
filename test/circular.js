/* global describe, it */
'use strict';

var assert = require('assert');
var express = require('express');
var dinja = require('..');

describe('circular dependencies', function () {
	it('should throw on circular dependencies', function () {
		var app = express();
		var inject = dinja(app);
		assert.throws(function () {
			inject('injected', function (dependency, req, res, next) {
				next(null, 'injected');
			});

			inject('dependency', function (injected, req, res, next) {
				next(null, 'dependency ' + injected);
			});
		}, /Cycle found: dependency -> injected/g);
	});

	it('should not throw on reusing dependencies', function () {
		var app = express();
		var inject = dinja(app);
		assert.doesNotThrow(function () {
			inject('cookies', function (req, res, next) {
				next();
			});

			inject('dependency', function (cookies, req, res, next) {
				next();
			});

			inject('pokemon', function (cookies, dependency, req, res, next) {
				next();
			});
		});
	});
});
