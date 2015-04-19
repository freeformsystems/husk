Table of Contents
=================

* [Husk](#husk)
  * [Install](#install)
  * [Examples](#examples)
    * [argv](#argv)
    * [async](#async)
    * [data-write](#data-write)
    * [exec](#exec)
    * [filter](#filter)
    * [fs](#fs)
    * [modify-file](#modify-file)
    * [pluck](#pluck)
    * [plugin-events](#plugin-events)
    * [process-pipe](#process-pipe)
    * [series](#series)
    * [stdin](#stdin)
    * [stream-events](#stream-events)
    * [transform](#transform)
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
npm i husk --save
```

## Examples

### argv

Extract values from program arguments.

```
ebin/argv index.js package.json
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().fs()
  .plugin([
    require('husk-argv'),
    require('husk-concat'),
    require('husk-pluck'),
    require('husk-lines'),
    require('husk-each'),
    require('husk-transform'),
    require('husk-stringify')
  ]);

husk(process.argv.slice(2))
  .argv()
  .pluck(function(){return this.unparsed})
  .each()
  .stat()
  .pluck(1)
  .transform(function(){return [{size: this.size}]})
  .concat()
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
[
  {
    "size": 40
  },
  {
    "size": 1471
  }
]
```

### async

Pass data to async functions.

```
ebin/async
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec()
  .plugin([
    require('husk-async'),
    require('husk-pluck')
  ]);

function timer(cb) {
  var chunk = this;
  function callback() {
    var s = ('' + chunk).trim().split('').reverse().join('') + '\n';
    cb(s);
  }
  setTimeout(callback, 10);
}

husk()
  .ls('lib')
  .async(timer)
  .pluck(0)
  .print()
  .run();
```

**Result**.

```
maerts
nigulp
sj.ksuh
```

### data-write

Pass data to be written on run.

```
ebin/data-write
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core()
  .plugin([
    require('husk-pluck'),
    require('husk-transform'),
    require('husk-stringify')
  ]);

husk(process.env)
  .pluck(function(){return this.EDITOR})
  .transform(function(){return {editor: this}})
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
{
  "editor": "vim"
}
```

### exec

Execute an external command with callback and listener.

```
ebin/exec
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec();

husk()
  .whoami(console.log.bind(null, '[code: %s, signal: %s]'))
    .once('end', console.log.bind(null, '[end] whoami'))
  .print()
  .run();
```

**Result**.

```
cyberfunk
[code: 0, signal: null]
[end] whoami
```

### filter

Filter array of lines with custom function.

```
ebin/filter
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec()
  .plugin([
    require('husk-lines'),
    require('husk-each'),
    require('husk-filter'),
    require('husk-split'),
    require('husk-object'),
    require('husk-stringify')
  ]);

husk()
  .ps('ax')
  .lines({buffer: true})
  .each()
  .filter(function(){return parseInt(this.split(/\s+/)[0]) === process.pid})
  .split()
  .object({schema: {pid: 0, tt: 1, stat: 2, time: 3, cmd: -4}})
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
{
  "pid": "38778",
  "tt": "s003",
  "stat": "R+",
  "time": "0:00.15",
  "cmd": "node ebin/filter"
}
```

### fs

Open fd, write close and print file content.

```
ebin/fs
```

**Source**.

```javascript
#!/usr/bin/env node

var path = require('path')
  , husk = require('..').core().exec().fs()
  .plugin([
    require('husk-pluck'),
    require('husk-buffer'),
    require('husk-transform'),
  ]);

var name = path.basename(__filename) + '-example.log'
  , content = '[file content]';

husk(name)
  .open('w')
  .pluck(1)
  .async(function writer(cb) {
    var fd = this.valueOf();
    var h = husk(fd)
      // write to fd is aliased write() -> fdwrite()
      .fdwrite(fd, content)
      .close(fd)
      .run(cb);
  })
  // re-read and print file to verify write
  .cat(name)
  .print(console.log)
  // clean up file, demo only
  .unlink(name)
  .run();
```

**Result**.

```
[file content]
```

### modify-file

Read, parse, modify and write out file.

```
ebin/modify-file
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec().fs()
  .plugin([
    require('husk-buffer'),
    require('husk-parse'),
    require('husk-filter'),
    require('husk-pluck'),
    require('husk-transform'),
    require('husk-stringify'),
  ]);

var input = 'package.json'
  , output = 'dependencies.json';

husk(input)
  .read()
  .buffer()
  // rewrite file path
  .through(function(){this.path = output})
  // parse as json and assign
  .parse(function(){return this.body}, {field: 'body'})
  // perform transformation
  .transform(function() {
    var body = this.body;
    for(var k in body.dependencies) {
      body.dependencies[k] = '~2.0.0';
    }
    return this;
  })
  // back to string for write
  .stringify(
    function(){return this.body.dependencies}, {indent: 2, field: 'output'})
  .write(function(){return this.output})
  .cat(output)
  .print()
  // clean up file, demo only
  .unlink(output)
  .run();
```

**Result**.

```
{
  "husk-core": "~2.0.0",
  "husk-exec": "~2.0.0",
  "husk-print": "~2.0.0",
  "zephyr": "~2.0.0"
}
```

### pluck

Read json from filesystem and pluck field.

```
ebin/pluck
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().fs()
  .plugin([
    require('husk-buffer'),
    require('husk-parse'),
    require('husk-filter'),
    require('husk-pluck'),
    require('husk-transform'),
    require('husk-stringify'),
  ]);

var path = require('path')
  , output = 'target';

husk('package.json')
  .read()
  .buffer()
  .parse(function(){return this.body})
  .pluck(function(){return this.dependencies})
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
{
  "husk-core": "~1.0.1",
  "husk-exec": "~1.0.1",
  "husk-print": "~1.0.1",
  "zephyr": "~1.2.6"
}
```

### plugin-events

Listen on streams using plugin chain.

```
ebin/plugin-events
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec()
  .plugin([
    require('husk-concat'),
    require('husk-buffer'),
    require('husk-lines'),
    require('husk-each'),
    require('husk-filter'),
    require('husk-transform'),
    require('husk-stringify')
  ]);

function onEnd(stream) {
  console.log('' + stream);
}

husk()
  .on('end', onEnd)
  .cd('lib')
  .find()
  .buffer()
  .lines()
  .each()
  .filter(function(){return /\.md$/.test(this)})
  .transform(function(){return [this]})
  .concat()
  .stringify({indent: 2})
  .print(function noop(){})
  .run();
```

**Result**.

```
[Process:Transform] find 
[Buffer:PassThrough]
[Line:Transform]
[Each:Transform]
[Filter:Transform]
[Transform:Transform]
[Concat:Transform]
[Stringify:Transform]
[Print:Transform] noop
```

### process-pipe

Pipe stdout of a command to the stdin of the next command.

```
ebin/process-pipe
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec();

husk()
  .ls('lib')
  // pipe `ls` stdout to `cat` stdin
  .fd(1)
  .cat()
  .print()
  .run();
```

**Result**.

```
husk.js
plugin
stream
```

### series

Execute commands in series.

```
ebin/series
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec();

husk()
  .echo(1, 2, 3)
  .sleep(.5)
  .echo('foo', 'bar')
  .print()
  .run();
```

**Result**.

```
1 2 3
foo bar
```

### stdin

Pipe stdin to various plugins to produce json.

```
who | ebin/stdin
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core()
  .plugin([
    require('husk-lines'),
    require('husk-each'),
    require('husk-split'),
    require('husk-object'),
    require('husk-concat'),
    require('husk-pluck'),
    require('husk-stringify')
  ]);

husk()
  .stdin()
  .lines({buffer: true})
  .each()
  .split()
  .object({schema: {user: 0, line: 1, when: -2}})
  .concat()
  .pluck(0)
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
{
  "user": "cyberfunk",
  "line": "console",
  "when": "Jan 1 10:20"
}
```

### stream-events

Bypass chained method calls and listen on streams.

```
ebin/stream-events
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core()
  , exec = require('husk-exec')
  , each = require('husk-each')
  , print = require('husk-print')
  , concat = require('husk-concat')
  , buffer =  require('husk-buffer')
  , lines = require('husk-lines')
  , filter = require('husk-filter')
  , transform = require('husk-transform')
  , stringify = require('husk-stringify');

function onEnd() {
  console.log('' + this);
}

var h = husk();
h
  .pipe(exec('find', ['lib']))
    .on('end', onEnd)
  .pipe(buffer())
    .on('end', onEnd)
  .pipe(lines())
    .on('end', onEnd)
  .pipe(each())
    .on('end', onEnd)
  .pipe(filter(function(){return /\.md$/.test(this)}))
    .on('end', onEnd)
  .pipe(transform(function(){return [this]}))
    .on('end', onEnd)
  .pipe(concat())
    .on('end', onEnd)
  .pipe(stringify({indent: 2}))
    .on('end', onEnd)
  .pipe(print(function noop(){}));

h.run(onEnd);
```

**Result**.

```
[Process:Transform]
[Buffer:PassThrough]
[Line:Transform]
[Each:Transform]
[Filter:Transform]
[Transform:Transform]
[Concat:Transform]
[Stringify:Transform]
[Print:Transform] noop
```

### transform

Find files, filter and transform to a json array.

```
ebin/transform
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec()
  .plugin([
    require('husk-concat'),
    require('husk-lines'),
    require('husk-each'),
    require('husk-filter'),
    require('husk-transform'),
    require('husk-stringify')
  ]);

husk()
  .cd('lib')
  .find()
  .lines({buffer: true})
  .each()
  .filter(function(){return /\/[a].*\/.*\.md$/.test(this)})
  .transform(function(){return [this]})
  .concat()
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
[
  "./plugin/argv/README.md",
  "./plugin/async/README.md",
  "./stream/argv/README.md",
  "./stream/async/README.md"
]
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
