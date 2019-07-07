
const stdPage = require('./stdPage');
const scraper = require('./scraper');
const fileCache = require('./file-cache');

const EMOJI_JSON = 'emojis.json';

main();

async function main() {
  try {
    await scrape();
  } catch(e) {
    console.error(e);
    process.exitCode = 1;
  }
  await stdPage.closeBrowser();
}

async function scrape() {
  let page, emojiData;
  emojiData = await fileCache.read(EMOJI_JSON);
  if(emojiData === null) {
    page = await stdPage.getPage();
    emojiData = await scraper.getEmojiData(page);
    await fileCache.write(EMOJI_JSON, JSON.stringify(emojiData));
  } else {
    emojiData = JSON.parse(emojiData.toString());
  }
  console.log(emojiData.map(val => val.native_emoji).join(' '));
}
