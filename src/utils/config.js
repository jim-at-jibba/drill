const os = require('os');
const path = require('path');

function resolveBaseDir(argv = process.argv.slice(2)) {
  const dirFlagIndex = argv.indexOf('--dir');
  let baseDir;

  if (dirFlagIndex !== -1 && argv[dirFlagIndex + 1]) {
    baseDir = argv[dirFlagIndex + 1];
  } else {
    baseDir = '~/drill';
  }

  if (baseDir.startsWith('~')) {
    baseDir = path.join(os.homedir(), baseDir.slice(1));
  }

  return path.resolve(baseDir);
}

module.exports = {
  resolveBaseDir
};
