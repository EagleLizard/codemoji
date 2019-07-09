
const EMOJI_CONSTANTS = require('./emoji-constants');

const COL_MAP = EMOJI_CONSTANTS.scraper.COL_MAP;

module.exports = {
  getEmojiData,
};

async function getEmojiData(page) {
  let bodyHandle, data;
  bodyHandle = await page.$('body');
  console.log('Scraping document table data...');
  data = await bodyHandle.$$eval('tr .chars', pageScrape, COL_MAP);
  return data;
}

function pageScrape(charsEls, COL_MAP) {
  let rows, emojiData;
  rows = charsEls.map(el => el.parentElement);
  emojiData = rows.map((row, rowIdx) => {
    let cols, rowData;
    cols = Array.from(row.children);
    rowData = cols.reduce((acc, curr, idx) => {
      let colKey, imgEl;
      colKey = COL_MAP[idx];
      switch(colKey) {
        case 'unicode':
          acc[colKey] = curr.innerText;
          acc.id = acc[colKey]
            .split('+')
            .join('-')
            .split(' ')
            .join('_')
            .toLowerCase();
          break;
        case 'native_emoji':
        case 'cldr_short_name':
          acc[colKey] = curr.innerText;
          break;
        case 'apple':
        case 'google':
        case 'facebook':
        case 'windows':
        case 'twitter':
          imgEl = curr.children[0];
          acc[colKey] = (imgEl === undefined)
            ? ''
            : imgEl.getAttribute('src') ;
          break;
        case 'row_num':
          acc[colKey] = rowIdx;
      }
      return acc;
    }, {});
    return rowData;
  });
  return emojiData;
}
