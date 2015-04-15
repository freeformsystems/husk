Table of Contents
=================

* [Husk](#husk)
  * [Install](#install)
  * [Usage](#usage)
  * [Developer](#developer)
    * [Test](#test)
    * [Cover](#cover)
    * [Documentation](#documentation)
    * [Readme](#readme)
  * [License](#license)

Husk
====

Command execution as transform streams.

Requires [node](http://nodejs.org) and [npm](http://www.npmjs.org).

## Install

```
npm i husk
```

## Usage

```javascript
var husk = require('../')
  , lines = require('husk-lines')
  , split = require('husk-split')
  , obj = require('husk-object')
  , stringify = require('husk-stringify');

var h = husk();
h.stdin()
  .pipe(lines())
  .pipe(split())
  .pipe(obj({schema: {user: 0, line: 1, when: -2}}))
  .pipe(stringify({indent: 2}))
  .pipe(process.stderr);
```

## Developer

### Test

Tests are not included in the package, clone the repository:

```
npm test
```

### Cover

To generate code coverage run:

```
npm run cover
```

### Documentation

To generate all documentation:

```
npm run docs
```

### Readme

To build the readme file from the partial definitions (requires [mdp](https://github.com/freeformsystems/mdp)):

```
npm run readme
```

## License

Everything is [MIT](http://en.wikipedia.org/wiki/MIT_License). Read the [license](https://github.com/freeformsystems/husk/blob/master/LICENSE) if you feel inclined.

Generated by [mdp(1)](https://github.com/freeformsystems/mdp).

[node]: http://nodejs.org
[npm]: http://www.npmjs.org
[mdp]: https://github.com/freeformsystems/mdp
