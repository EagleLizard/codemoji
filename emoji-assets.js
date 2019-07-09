
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

const rimraf = promisify(require('rimraf'));

const { exists } = require('./files');
const EMOJI_CONSTANTS = require('./emoji-constants');
const COL_MAP = EMOJI_CONSTANTS.scraper.COL_MAP;

const ASSET_DIR = path.resolve(__dirname, '_assets');
const FILE_PROPERTIES = [
  COL_MAP[3],
  COL_MAP[4],
  COL_MAP[5],
  COL_MAP[6],
  COL_MAP[7],
];

module.exports = {
  build
};

async function build(emojiDataArr) {
  let assetDirExists, filePromises;
  assetDirExists = await exists(ASSET_DIR);
  if(assetDirExists) {
    await rimraf(ASSET_DIR);
  } else {
    await mkdir(ASSET_DIR);
  }
  filePromises = emojiDataArr.map(writeEmojiImageData);
  await Promise.all(filePromises);
}

async function writeEmojiImageData(emojiData) {
  let filePromises, dirPath;
  filePromises = [];
  dirPath = path.resolve(ASSET_DIR, emojiData.id);
  await mkdir(dirPath);
  FILE_PROPERTIES.forEach(fileProp => {
    let srcStr, filePath, imageData, filePromise;
    srcStr = emojiData[fileProp];
    if(srcStr) {
      imageData = getImageData(srcStr);
      filePath = path.resolve(dirPath, `${fileProp}.${imageData.fileExtension}`);
      filePromise = writeImageData(filePath, imageData.data, imageData.encoding);
      filePromises.push(filePromise);
    }
  });
  return Promise.all(filePromises);
}

async function writeImageData(filePath, dataStr, encoding) {
  let imgBuffer;
  imgBuffer = Buffer.from(dataStr, encoding);
  await writeFile(filePath, imgBuffer);
}

function getImageData(srcStr) {
  let dataFormat, encoding, mimeType, data,
    fileType, fileExtension;
  [ dataFormat, data ] = srcStr.split(',');
  [ mimeType, encoding ] = dataFormat.split(';');
  mimeType = mimeType.split(':').pop();
  fileType = mimeType.split('/').pop();
  fileExtension = (fileType === 'jpeg')
    ? 'jpg'
    : fileType ;
  return {
    mimeType,
    encoding,
    fileExtension,
    data,
  };
}
