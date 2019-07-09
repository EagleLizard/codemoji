
const fs = require('fs');
const { promisify } = require('util');
const lstat = promisify(fs.lstat);

module.exports = {
  exists,
};

async function exists(filePath) {
  let stats;
  try {
    stats = await lstat(filePath, fs.constants.F_OK);
  } catch(e) {
    if(e.code === 'ENOENT') {
      return false;
    }
    throw e;
  }
  return stats;
}
