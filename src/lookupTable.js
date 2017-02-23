const getModuleLocation = require('./utils/getModuleLocation');

// A fucntion that takes an array of modules, in the form of [{id: 2, code: (ast), lookup: {'./foo':
// 3}}] and resolves them into filepaths using an embedded lookup table. If a lookup table is
// present, this function merges all the relative file paths together, taking account for
// node_modules, and then outputs an array of objects that look like [{filePath: 'dist/foo', code:
// (ast)}] or something similar.
function lookupTableResolver(modules, knownPaths, type="browserify", pathPrefix='dist/') {
  // Assemble the file structure on disk.
  return modules.map(i => {
    return {
      filePath: getModuleLocation(modules, i, knownPaths, pathPrefix),
      code: i.code,
    };
  });
}

module.exports = lookupTableResolver;
