# express-dinja [![NPM Version](https://badge.fury.io/js/express-dinja.png)](https://npmjs.org/package/express-dinja) [![Build Status](https://travis-ci.org/floatdrop/express-dinja.png?branch=master)](https://travis-ci.org/floatdrop/express-dinja) [![Coverage Status](https://coveralls.io/repos/floatdrop/express-dinja/badge.png?branch=master)](https://coveralls.io/r/floatdrop/express-dinja) [![Dependency Status](https://gemnasium.com/floatdrop/express-dinja.png)](https://gemnasium.com/floatdrop/express-dinja)

Use dependency injection pattern for Express applications.

## Usage

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

## License

The MIT License (MIT) © [Vsevolod Strukchinsky](floatdrop@gmail.com)
