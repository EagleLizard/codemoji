
const COL_MAP = {
  0: 'row_num',
  1: 'unicode',
  2: 'native_emoji',
  3: 'apple',
  4: 'google',
  5: 'facebook',
  6: 'windows',
  7: 'twitter',
  8: 'joy',
  9: 'samsung',
  10: 'gmail',
  11: 'sb',
  12: 'dcm',
  13: 'kddi',
  14: 'cldr_short_name'
};

module.exports = {
  getEmojiData
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
  emojiData = rows.map(row => {
    let cols, rowData;
    cols = Array.from(row.children);
    rowData = cols.reduce((acc, curr, idx) => {
      let colKey, imgEl;
      colKey = COL_MAP[idx];
      switch(colKey) {
        case 'unicode':
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
      }
      return acc;
    }, {});
    return rowData;
  });
  return emojiData;
}
