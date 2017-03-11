![Debundle](debundle_logo.png)

# debundle

This is a tool to decode javascript bundles produced by tools like [Webpack](https://webpack.github.io/) and [Browserify](http://browserify.org/)
into their original, pre-bundled source.

[![Build Status](https://travis-ci.org/1egoman/debundle.svg?branch=master)](https://travis-ci.org/1egoman/debundler)

## Why would I want to debundle my code?
Reasons vary, but this tool was originally developed to help me with a reverse engineering project.
Needless to say, sifting through minified bundles to try and figure out how a service works isn't
fun and is a lot easier when that bundle is broken into files and those files have semantic names. 

## Installation
```
npm i -g debundle
```

## Running
```
$ debundle
Usage: debundle [input file] {OPTIONS}

Options:
   --input,  -i  Bundle to debundle
   --output, -o  Directory to debundle code into.
   --config, -c  Configuration file

$ cat debundle-config.json
{
  "type": "webpack",
  "entryPoint": 1,
  "knownPaths": {}
}
$ debundle -i my-bundle.js -o dist/ -c debundle-config.json
$ tree dist/
dist/
├── index.js
└── node_modules
    ├── number
    │   └── index.js
    └── uuid
        ├── index.js
        ├── lib
        │   ├── bytesToUuid.js
        │   └── rng.js
        ├── v1.js
        └── v4.js
4 directories, 7 files
```

# Configuration

## Simple configuration
```
{
  "type": "webpack",
  "entryPoint": 1,
  "knownPaths": {}
}
```

(To debundle a simple Browserify bundle, replace `webpack` the above configuration with `browserify`)

## Documentation

### `type` (required)
A webpack or browserify bundle.

### `entryPoint` (required for webpack bundles)
The entry point module id. If left empty in a Browserify bundle it can often be calculated
procedurally.

### `knownPaths` (required)
An object mapping module ids to the location on disk to put a given module. For example, `{"1":
"./foo", "2": "mypackage/index", "3": "./bar/baz"}` would make this structure:
```
├── foo.js
├── bar
│   └── baz.js
└── node_modules
    └── mypackage
        └── index.js
```
  - If the path starts with `./`, it's relative to the output directory.
  - Otherwise, the path is treated as a node module, with the first path directory indicating the
    package name inside of `node_modules` and the rest of the path indicating where inside that
    module to put the file.

### `moduleAst`
Instructions to get a reference to the module ast. Only required in weird bundles where the location
of the modules AST can't be found (because it's in a different location in the bundle, for example).
This is indicated as an array of strings / numbers used to traverse through the AST data structure.

### `replaceRequiresInline`
Defaults to `true`. When working on a minified bundle, tell debundle how to adjust `require` 
statements to work in a node context. This is required because often minifiers will change the
identifier that require is set to in the module wrapping function to save on bytes.

Imaging this module is being debundled:
```
// ...
function (module, exports, n) {
  const myOtherModule = n(5);
  console.log(myOtherModule);
  function nestedFunction() {
    const n = 123;
  }
}
// ...
```

With `replaceRequiresInline` set to true, it'd look like this:
```
const myOtherModule = require(5);
console.log(myOtherModule);
function nestedFunction() {
  const require = 123;
}
```

- Is able to be rebundled by popular bundlers (browserify and webpack) and can be run in node
- Unfortunately, isn't able to handle scoping very well, and changes any coincidentally matching
symbols inside inner lexical scopes too, as can be seen above.

With `replaceRequiresInline` set to false, it'd look like this:
```
const n = require;
const myOtherModule = n(5);
console.log(myOtherModule);
function nestedFunction() {
  const n = 123;
}
```

- Handles scoping well - the inner scope maintains its value.
- Is able to be rebundled by *webpack* and can be run in node, but browserify chokes. Because
browserify is looking for the `require` function call when crawling your app, it isn't able to see
through the variable assignment.
- Isn't as nice to look at. `¯\_(ツ)_/¯`



For example, `["foo", "bar", 0, "baz", 1]` would get `ast.foo.bar[0].baz[1]`.

# Contributing
- After cloning down the project, run `npm install` - that should be it.
- Debundler entry point is `./src/index.js` (that's how you run it!)
- A bunch of sample bundles are in `test_bundles/`. A script, `test_bundles/run_test.sh` can run the
  debundler against a given bundle and try to debundle it into `dist/`. (CI will, as part of running
  tests, debundle all the bundles in that folder.)
- Make sure any contribution pass the tests: `npm test`

# Legal note
Some companies specify in their terms of service that their code cannot be "reverse engineered".
Debundling can definitely (depending on how you're using the code) fall under that umbrella.
Understand what you are doing so you don't break any agreements :smile:
