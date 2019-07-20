
// const yargs = require('yargs');

const stdPage = require('./stdPage');
const fileCache = require('./file-cache');
const emojiAssets = require('./emoji-assets');

const EMOJI_JSON = 'emojis.json';

main();

async function main() {
  let startMs, endMs, duration;
  startMs = Date.now();
  try {
    // await scrape();
    await xmlParse();
  } catch(e) {
    console.error(e);
    process.exitCode = 1;
  }
  endMs = Date.now();
  duration = endMs - startMs;
  console.log(`Took ${duration}ms`);
  await stdPage.closeBrowser();
}

async function xmlParse() {
  let emojiData;
  emojiData = await fileCache.read(EMOJI_JSON);
  if(emojiData === null) {
    console.log('Cached emoji data not found, parsing source doc...');
    emojiData = await stdPage.xmlParse();
    await fileCache.write(EMOJI_JSON, JSON.stringify(emojiData, null, 2));
  } else {
    emojiData = JSON.parse(emojiData.toString());
  }
  await emojiAssets.build(emojiData);
}
