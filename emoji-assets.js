
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const rimraf = promisify(require('rimraf'));

const { exists } = require('./files');
const EMOJI_CONSTANTS = require('./emoji-constants');
const COL_MAP = EMOJI_CONSTANTS.scraper.COL_MAP;

const ASSER_DIR = '_assets';
const ASSET_PATH = path.resolve(__dirname, ASSER_DIR);
const EMOJI_META = 'emoji-meta.json';
const EMOJI_META_PATH = path.resolve(__dirname, EMOJI_META);
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
  let assetDirExists, assetMetaExists, filePromises, emojiMeta;
  [ assetDirExists, assetMetaExists ] = await Promise.all([
    exists(ASSET_PATH),
    exists(EMOJI_META_PATH),
  ]);
  if(assetDirExists) {
    await rimraf(ASSET_PATH);
  }
  if(assetMetaExists) {
    await unlink(EMOJI_META_PATH);
  }
  await mkdir(ASSET_PATH);
  filePromises = emojiDataArr.map(writeEmojiImageData);
  emojiMeta = (await Promise.all(filePromises)).reduce((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});
  await writeFile(EMOJI_META_PATH, JSON.stringify(emojiMeta, null, 2));
}

async function writeEmojiImageData(emojiData) {
  let filePromises, dirPath, validEmojiFiles;
  filePromises = [];
  validEmojiFiles = Object.keys(emojiData)
    .filter(emojiKey => !FILE_PROPERTIES.find(prop => emojiKey === prop))
    .reduce((acc, emojiKey) => {
      acc[emojiKey] = emojiData[emojiKey];
      return acc;
    }, {});
  dirPath = path.resolve(ASSET_PATH, emojiData.id);
  await mkdir(dirPath);
  FILE_PROPERTIES.forEach(fileProp => {
    let srcStr, fileName, filePath, imageData, filePromise;
    srcStr = emojiData[fileProp];
    if(srcStr) {
      imageData = getImageData(srcStr);
      fileName = `${fileProp}.${imageData.fileExtension}`;
      filePath = path.resolve(dirPath, fileName);
      filePromise = writeImageData(filePath, imageData.data, imageData.encoding);
      filePromises.push(filePromise);
      validEmojiFiles[fileProp] = path.resolve(ASSER_DIR, fileName);
    }
  });
  return Promise.all(filePromises).then(() => validEmojiFiles);
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
