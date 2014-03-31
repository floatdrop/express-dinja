'use strict';

var utils = require('express/lib/utils');
var argnames = require('get-parameter-names');
var async = require('async');

module.exports = function (app) {
    var dependencies = {};
    var route = app._router.route;

    var resolvePath;

    function resolveInjections(params, req, res, next, done) {
        /*jshint validthis:true */
        var self = this;

        async.mapSeries(params, function (dependency, callback) {
            if (dependency === 'req') { return callback(null, req); }
            if (dependency === 'res') { return callback(null, res); }
            if (dependency === 'next') { return callback(null, next); }

            if (resolvePath.indexOf(dependency) !== -1) {
                throw new Error('Circular dependencies: ' + resolvePath.join(' -> ') + ' -> ' + dependency);
            }

            resolvePath.push(dependency);
            var constructor = dependencies[dependency];

            if (!constructor) {
                throw new Error('Unknown dependency: ' + dependency);
            }

            resolveInjections(argnames(constructor), req, res, function (err, result) {
                callback(err, result);
            }, function (err, results) {
                constructor.apply(self, results);
            });
        }, done);
    }

    app._router.route = function (method, path) {
        var callbacks = utils.flatten([].slice.call(arguments, 2));

        callbacks = callbacks.map(function (fn) {
            if (typeof fn !== 'function') { return fn; }
            var params = argnames(fn);

            return function (req, res, next) {
                var self = this;
                resolvePath = [];
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

        dependencies[dependency] = fn;
    };
};
