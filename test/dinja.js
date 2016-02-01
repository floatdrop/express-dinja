/* global describe, it */
'use strict';

var assert = require('assert');
var express = require('express');
var request = require('supertest');
var dinja = require('..');

describe('base functionality', function () {
	it('should create inject from express app', function () {
		var app = express();
		var inject = dinja(app);
		assert.equal(typeof inject, 'function');
	});

	it('should accept only functions', function () {
		var app = express();
		var inject = dinja(app);
		assert.throws(function () {
			inject('dependency', 'wow');
		}, /inject\(\) requires a function, but got a string/);
	});

	it('should not break application with injection', function (done) {
		var app = express();
		var inject = dinja(app);

		app.get('/', function (req, res) {
			res.status(200).end();
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
			assert.equal(dependency, 'injected');
			assert.equal(typeof next, 'function');
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
			assert.equal(dependency1, 'injected1');
			assert.equal(dependency2, 'injected2');
			assert.equal(typeof next, 'function');
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
			assert.equal(typeof next, 'function');
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
			assert.equal(dependency, 'dependency injected');
			assert.equal(typeof next, 'function');
			res.status(200).end();
		});

		request(app)
			.get('/')
			.expect(200, done);
	});
});
