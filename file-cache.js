
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const { exists } = require('./files');

const CACHE_DIR = path.resolve(__dirname, '_cache');

(async () => {
  await initCache();
})();

module.exports = {
  read,
  write
};

async function initCache() {
  let cacheStats;
  cacheStats = await exists(CACHE_DIR);
  if(cacheStats && !cacheStats.isDirectory()) {
    await unlink(CACHE_DIR);
    cacheStats = false;
  }
  if(!cacheStats) {
    await mkdir(CACHE_DIR);
  }
}

async function write(fileName, data) {
  let filePath;
  filePath = path.resolve(CACHE_DIR, fileName);
  await writeFile(filePath, data);
}

async function read(fileName) {
  let filePath, docExists;
  filePath = path.resolve(CACHE_DIR, fileName);
  docExists = await exists(filePath);
  if(!docExists) {
    return null;
  }
  return await readFile(filePath);
}
