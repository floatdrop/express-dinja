'use strict';

var express = require('express');
var utils = require('express/lib/utils');
var argnames = require('get-parameter-names');
var methods = require('methods');
var async = require('async');
var Dag = require('dag');
var needInject = require('./utils.js').needInject;

module.exports = function (app) {
    var dependencies = {};
    var dag = new Dag();

    function resolveInjections(params, req, res, next, done) {
        /*jshint validthis:true */
        var self = this;

        async.mapSeries(params, function (dependency, callback) {
            if (dependency === 'req') { return callback(null, req); }
            if (dependency === 'res') { return callback(null, res); }
            if (dependency === 'next') { return callback(null, next); }

            var constructor = dependencies[dependency];

            if (!constructor) {
                throw new Error('Unknown dependency: ' + dependency);
            }

            resolveInjections(argnames(constructor), req, res, function (err, result) {
                callback(err, result);
            }, function (err, results) {
                if (err) {
                    return done(err);
                }
                constructor.apply(self, results);
            });
        }, done);
    }

    methods.concat('all').forEach(function(method) {
        var origin = express.Route.prototype[method];

        express.Route.prototype[method] = function () {
            var callbacks = utils.flatten([].slice.call(arguments));

            callbacks = callbacks.map(function (fn) {
                if (typeof fn !== 'function') { return fn; }
                var params = argnames(fn);

                if (!needInject(params)) {
                    return fn;
                }

                return function (req, res, next) {
                    var self = this;
                    resolveInjections.bind(self)(params, req, res, next, function (err, results) {
                        if (err) {
                            return next(err);
                        }
                        fn.apply(self, results);
                    });
                };
            });

            origin.call(this, callbacks);
        };
    });

    return function (dependency, fn) {
        if (typeof fn !== 'function') {
            throw new Error('inject() requires a function, but got a ' + typeof fn);
        }

        argnames(fn).forEach(function (param) {
            dag.addEdge(dependency, param);
        });

        dependencies[dependency] = fn;
    };
};
