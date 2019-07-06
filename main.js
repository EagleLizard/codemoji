
const stdPage = require('./stdPage');
const scraper = require('./scraper');

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
  page = await stdPage.getPage();
  emojiData = await scraper.getEmojiData(page);
}
