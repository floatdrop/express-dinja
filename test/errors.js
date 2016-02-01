/* global describe, it */
'use strict';

var assert = require('assert');
var request = require('supertest');
var express = require('express');
var dinja = require('..');

describe('errors handling', function () {
	it('should pass errors from dependencies', function (done) {
		var app = express();
		var inject = dinja(app);

		inject('bad', function (req, res, next) {
			next('an error');
		});

		app.get('/', function (bad, req, res) {
			assert.ifError(bad);
			res.status(200).end();
		});

		app.use(function (err, req, res, next) {
			res.status(500).send(err.toString());
			assert.equal(typeof next, 'function');
		});

		request(app)
			.get('/')
			.expect(500, 'an error', done);
	});

	it('should pass errors from sub-dependencies', function (done) {
		var app = express();
		var inject = dinja(app);

		inject('bad', function (req, res, next) {
			next('an error');
		});

		inject('good', function (bad, req, res, next) {
			next();
		});

		app.get('/', function (req, res, good) {
			assert.ifError(good);
			res.status(200).end();
		});

		app.use(function (err, req, res, next) {
			res.status(500).send(err.toString());
			assert.equal(typeof next, 'function');
		});

		request(app)
			.get('/')
			.expect(500, 'an error', done);
	});
});
