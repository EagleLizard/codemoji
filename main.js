
const yargs = require('yargs');

const stdPage = require('./stdPage');
const fileCache = require('./file-cache');
const emojiAssets = require('./emoji-assets');
const emojiService = require('./emojiService');

const EMOJI_JSON = 'emojis.json';

main(yargs.argv);

async function main(argv) {
  let emojiData, emojiArr, foundEmojis;
  try {
    
    if(argv.s) {
      console.log(`argv.s: ${argv.s}`);
      emojiData = await getEmojiData();
      emojiArr = Object.keys(emojiData).reduce((acc, curr) => {
        acc.push(emojiData[curr]);
        return acc;
      }, []);
      foundEmojis = search(argv.s, emojiArr);
      console.log(foundEmojis.map(emoji => {
        return emoji.native_emoji;
      }).join(' '));
    } else {
      await parseEmojiData();
    }
  } catch(e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await stdPage.closeBrowser();
  }
}

function search(searchTerm, emojiArr) {
  foundEmojis = emojiArr.filter(emoji => {
    let shortNames, foundShortNameIdx;
    if(!emoji.cldr_short_name) {
      return false;
    }
    return emoji.cldr_short_name.includes(searchTerm);
  });
  return foundEmojis;
}

async function parseEmojiData() {
  let startMs, endMs, duration;
  startMs = Date.now();
  try {
    await stdPage.xmlParse();
  } catch(e) {
    console.error(e);
    throw e;
  }
  endMs = Date.now();
  duration = endMs - startMs;
  console.log(`Duration: ${duration}ms`);
  await stdPage.closeBrowser();
}

async function getEmojiData() {
  let emojiData;
  emojiData = await fileCache.read(EMOJI_JSON);
  if(emojiData === null) {
    console.log('Cached emoji data not found, parsing source doc...');
    emojiData = await stdPage.xmlParse();
    await fileCache.write(EMOJI_JSON, JSON.stringify(emojiData, null, 2));
    await emojiAssets.build(emojiData);
  } else {
    emojiData = JSON.parse(emojiData.toString());
  }
  return emojiData;
}
