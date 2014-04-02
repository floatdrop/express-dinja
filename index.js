'use strict';

var utils = require('express/lib/utils');
var argnames = require('get-parameter-names');
var async = require('async');
var Dag = require('dag');

function arraysEqual(arr1, arr2) {
    if (arr1 === arr2) { return true; }
    if (arr1 === null || arr2 === null) { return false; }
    if (arr1.length !== arr2.length) { return false; }

    for (var i = 0; i < arr1.length; ++i) {
        if (arr1[i] !== arr2[i]) { return false; }
    }

    return true;
}

function needInject(parameters) {
    var skipRules = [
        [],
        ['req'],
        ['req', 'res'],
        ['req', 'res', 'next'],
        ['err', 'req', 'res', 'next'],
        ['error', 'req', 'res', 'next']
    ];
    for (var i = 0; i < skipRules.length; ++i) {
        if (arraysEqual(skipRules[i], parameters)) {
            return false;
        }
    }
    return true;
}

module.exports = function (app) {
    var dependencies = {};
    var route = app._router.route;
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

    app._router.route = function (method, path) {
        var callbacks = utils.flatten([].slice.call(arguments, 2));

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

        route.call(this, method, path, callbacks);
    };

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
