const getModuleLocation = require('./getModuleLocation');

const assert = require('assert');
const path = require('path');

const {generateFunction, generateRequire} = require('../testHelpers');

it('should be able to get a module path generated by module id', () => {
  const modules = [
    {
      id: 1,
      code: generateFunction(
        generateRequire(2)
      ),
    },
    {
      id: 2,
      code: generateFunction(),
    },
  ];

  const knownPaths = {
  };
  const pathPrefix = 'dist';
  const output = getModuleLocation(modules, modules[0], knownPaths, pathPrefix);

  assert.deepEqual(output, path.join(pathPrefix, '1'));
});

it('should be able to get a module path from a knownPath', () => {
  const modules = [
    {
      id: 1,
      code: generateFunction(
        generateRequire(2)
      ),
    },
    {
      id: 2,
      code: generateFunction(),
    },
  ];

  const knownPaths = {
    1: './foo/bar/baz',
  };
  const pathPrefix = 'dist';
  const output = getModuleLocation(modules, modules[0], knownPaths, pathPrefix);

  assert.deepEqual(output, path.join(pathPrefix, 'foo', 'bar', 'baz'));
});

// Using a lookup table in each module

it('should default to index for the entry point', () => {
  const modules = [
    {
      id: 1,
      code: generateFunction(
        generateRequire(2)
      ),
      lookup: {},
    },
    {
      id: 2,
      code: generateFunction(),
      lookup: {},
    },
  ];

  const knownPaths = {
  };
  const pathPrefix = 'dist';
  const output = getModuleLocation(modules, modules[0], knownPaths, pathPrefix);

  assert.deepEqual(output, path.join(pathPrefix, 'index'));
});

it(`should do a lookup within another module (0) to determine a path to a given module (1)`, () => {
  const modules = [
    {
      id: 1,
      code: generateFunction(
        generateRequire(2)
      ),
      lookup: {'./foo': 2},
    },
    {
      id: 2,
      code: generateFunction(),
      lookup: {},
    },
  ];

  const knownPaths = {
  };
  const pathPrefix = 'dist';
  const output = getModuleLocation(modules, modules[1], knownPaths, pathPrefix);

  assert.deepEqual(output, path.join(pathPrefix, 'foo'));
});

// NOTE: need some work to make this one pass
it.skip(`should do a lookup within another module (0) where that module has a knownPath`, () => {
  const modules = [
    {
      id: 1,
      code: generateFunction(
        generateRequire(2)
      ),
      lookup: {'./baz': 2},
    },
    {
      id: 2,
      code: generateFunction(),
      lookup: {},
    },
  ];

  const knownPaths = {
    1: './foo/bar',
  };
  const pathPrefix = 'dist';
  const output = getModuleLocation(modules, modules[1], knownPaths, pathPrefix);

  assert.deepEqual(output, path.join(pathPrefix, 'foo', 'bar', 'baz'));
});

// Using node_modules

it(`should do a lookup within another module (0) where the looked up module (1) is a node_module`, () => {
  const modules = [
    {
      id: 1,
      code: generateFunction(
        generateRequire(2)
      ),
      lookup: {'foo': 2},
    },
    {
      id: 2,
      code: generateFunction(),
      lookup: {},
    },
  ];

  const knownPaths = {
  };
  const pathPrefix = 'dist';
  const appendTrailingIndexFilesToNodeModules = false; // makes the path `node_modules/foo/index`, not `node_modules/foo`
  const output = getModuleLocation(modules, modules[1], knownPaths, pathPrefix, appendTrailingIndexFilesToNodeModules);

  // NOTE: There's a trailing slash at the end of output. This could change in the future, so the
  // below test may need th to change to remove the '/' arg from the end of the 2nd path.
  assert.deepEqual(output, path.join(pathPrefix, 'node_modules', 'foo', '/'));
});

it(`should do a lookup within another module (0) where the looked up module (1) is a node_module (appendTrailingIndexFilesToNodeModules)`, () => {
  const modules = [
    {
      id: 1,
      code: generateFunction(
        generateRequire(2)
      ),
      lookup: {'foo': 2},
    },
    {
      id: 2,
      code: generateFunction(),
      lookup: {},
    },
  ];

  const knownPaths = {
  };
  const pathPrefix = 'dist';
  const appendTrailingIndexFilesToNodeModules = true; // makes the path `node_modules/foo/index`, not `node_modules/foo`
  const output = getModuleLocation(modules, modules[1], knownPaths, pathPrefix, appendTrailingIndexFilesToNodeModules);

  assert.deepEqual(output, path.join(pathPrefix, 'node_modules', 'foo', 'index'));
});
