# express-dinja

[![NPM Version](https://badge.fury.io/js/express-dinja.png)](https://npmjs.org/package/express-dinja) [![Build Status](https://travis-ci.org/floatdrop/express-dinja.png?branch=master)](https://travis-ci.org/floatdrop/express-dinja) [![Coverage Status](https://coveralls.io/repos/floatdrop/express-dinja/badge.png?branch=master)](https://coveralls.io/r/floatdrop/express-dinja) [![Dependency Status](https://gemnasium.com/floatdrop/express-dinja.png)](https://gemnasium.com/floatdrop/express-dinja) [![Code Climate](https://codeclimate.com/github/floatdrop/express-dinja.png)](https://codeclimate.com/github/floatdrop/express-dinja)

Use dependency injection pattern for Express applications. Inspired by [express-di](https://github.com/floatdrop/express-di).

## Example

```js
var express = require('express');
var app = express();
var inject = require('../index.js')(app);

inject('injected', function (req, res, next) {
    next(null, 'injected');
});

inject('dependency', function (injected, req, res, next) {
    next(null, 'dependency ' + injected);
});

app.get('/', function (dependency, req, res, next) {
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

In express there is no built-in way to start execution of middlewares parallel, so you have two choises:

 1. Linearize middlewares tree and launch them one after one &mdash; and drop performance of app
 2. Write meta-middleware, that will launch independent middlewares side-by-side &mdash; and write boilerplate code

To reduce boilerplate code (you can see it in statusTodos function below) dependency injection pattern was added to express route function.
Here is example how would applications look in plain express middlewares, express with express-dinja and [fist framework](https://github.com/fistlabs/fist):

![express vs express-dinja vs express-fist](https://cloud.githubusercontent.com/assets/365089/2588957/892f28fe-ba44-11e3-85f4-409d5ddc7eaf.png)


## Difference from express-di

This module is heavily based on code from `express-di`, but has additional features, that I think is necessary for full dependency injection.

 * Dependency resolving in injected dependencies
 * No cache

## API

### expressInject(app)
```js
var expressInject = require('express-inject');
```

Returns `Function`, that can inject dependencies into express application `app`. It will patch `route` method to enable injections in route-specific methods like `use`, `get`, `post` and etc.

### inject(name, fn)

```js
var app = express();
var inject = expressInject(app);
```

Injects dependency with name `name` and dependent express middlewares `fn`.

`fn` almost identically inherits express middleware signature: `function([dependencies], req, res, next)` but with two differences:

 1. It can have own dependencies, that will be resolved, when this middleware is called.
 2. `next(err, value)` function accepts two arguments: `err` and `value` of dependency.

`req`, `res` and `next` names are pre-defined to corresponding arguments of express middleware.

You can see [example](https://github.com/floatdrop/express-dinja#example) for details.

## License

The MIT License (MIT) © [Vsevolod Strukchinsky](floatdrop@gmail.com)
