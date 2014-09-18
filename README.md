# express-dinja

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Status][depstat-image]][depstat-url]

Use dependency injection pattern for Express applications. Inspired by [express-di](https://github.com/luin/express-di).

## Compatibility

 * `3.x` version is for use with `express@3`
 * `4.x` version is for use with `express@4`

__Be aware__: `4.x` version now using `async.map` for dependency resolving (instead of `async.mapSeries`).

## Usage

```js
var express = require('express');
var app = express();
var inject = require('express-dinja')(app);

inject('injected', function (req, res, next) {
    next(null, 'injected');
});

inject('dependency', function (injected, req, res, next) {
    next(null, 'dependency ' + injected);
});

app.get('/', function (dependency, req, res) {
    res.json({
        dinja: dependency
    });
});

require('http').createServer(app).listen(8080);
```

On [localhost:8080](http://localhost:8080) you should see:

```json
{
    "dinja": "dependency injected"
}
```

## Why

Suppose you have this middleware dependency tree:

![middlewares](https://cloud.githubusercontent.com/assets/365089/2589017/c0292b1a-ba45-11e3-9a1b-57e63d5cdcd2.png)


In express there is no built-in way to start execution of middlewares parallel, so you have two choices:

 1. Linearize middlewares tree and launch them one after one &mdash; and drop performance of app
 2. Write meta-middleware, that will launch independent middlewares side-by-side &mdash; and write boilerplate code

To reduce boilerplate code (you can see it in statusTodos function below) dependency injection pattern was added to express route function.
Here is example how would applications look in plain express middlewares, express with express-dinja and [fist framework](https://github.com/fistlabs/fist):

![express-vs-fist](https://cloud.githubusercontent.com/assets/365089/4318952/5fae9774-3f25-11e4-940a-b4d557750a1d.png)

## Difference from express-di

This module is heavily based on code from `express-di`, but has additional features, that I think is necessary for full dependency injection.

 * Dependency resolving in injected dependencies
 * No cache

## Benchmark

I used benchmark from [`express-di`](https://github.com/luin/express-di/tree/master/benchmarks) to compare bare express application performance with patched version. Benchmark takes application with one middleware, that uses dependency injection and after middleware is done - sends 'Hello world' response.

Middleware is faked database connection, which will response in predefined time (horisontal bar) and requests/sec is the vertical bar:

![Performance chart](https://cloud.githubusercontent.com/assets/365089/2590257/9d323e76-ba59-11e3-8ea9-66bae5854c46.png)

## API

### dinja(app)

Returns `Function`, that can inject dependencies into express application `app`. It will patch `route` method to enable injections in route-specific methods like `use`, `get`, `post` and etc.

### inject(name, fn)

Injects dependency with name `name` and dependent express middlewares `fn`.

`fn` almost identically inherits express middleware signature: `function([dependencies], req, res, next)` but with two differences:

 1. It can have own dependencies, that will be resolved, when this middleware is called.
 2. `next(err, value)` function accepts two arguments: `err` and `value` of dependency.

`req`, `res` and `next` names are pre-defined to corresponding arguments of express middleware.

## License

The MIT License (MIT) © [Vsevolod Strukchinsky](floatdrop@gmail.com)

[npm-url]: https://npmjs.org/package/express-dinja
[npm-image]: http://img.shields.io/npm/v/express-dinja.svg?style=flat

[travis-url]: https://travis-ci.org/floatdrop/express-dinja
[travis-image]: http://img.shields.io/travis/floatdrop/express-dinja.svg?style=flat

[coveralls-url]: https://coveralls.io/r/floatdrop/express-dinja
[coveralls-image]: http://img.shields.io/coveralls/floatdrop/express-dinja.svg?style=flat

[depstat-url]: https://david-dm.org/floatdrop/express-dinja
[depstat-image]: http://img.shields.io/david/floatdrop/express-dinja.svg?style=flat
