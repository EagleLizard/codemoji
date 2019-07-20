
const puppeteer = require('puppeteer');
const libxml = require('libxmljs');

const fileCache = require('./file-cache');
const EMOJI_CONSTANTS = require('./emoji-constants');

const COL_MAP = EMOJI_CONSTANTS.scraper.COL_MAP;

const EMOJI_STD_URL = 'https://unicode.org/emoji/charts/full-emoji-list.html';
const DEFAULT_PAGE_TIMEOUT = 3e6;

let browser, page;

module.exports = {
  xmlParse,
  closeBrowser
};

async function xmlParse() {
  let pageContent, doc, emojiRows, emojiData;
  pageContent = await getPageContent();
  doc = libxml.parseHtmlString(pageContent);
  emojiRows = doc.root().find('//tr').filter(trEl => {
    let charEl;
    charEl = trEl.find('td[@class=\'chars\']')[0];
    return charEl !== undefined;
  });
  emojiData = getEmojiDataFromRows(emojiRows);
  return emojiData;
}

function getEmojiDataFromRows(trEls) {
  return trEls.map((trEl, rowIdx) => {
    let tdEls;
    tdEls = trEl.find('td');
    return tdEls.reduce((acc, tdEl, idx) => {
      let colKey, imgEl;
      colKey = COL_MAP[idx];
      switch(colKey) {
        case 'unicode':
          acc[colKey] = tdEl.find('a')[0].text();
          acc.id = acc[colKey]
            .split('+')
            .join('-')
            .split(' ')
            .join('_')
            .toLowerCase();
          break;
        case 'native_emoji':
        case 'cldr_short_name':
          acc[colKey] = tdEl.text();
          break;
        case 'apple':
        case 'google':
        case 'facebook':
        case 'windows':
        case 'twitter':
          imgEl = tdEl.find('img')[0];
          acc[colKey] = (imgEl === undefined)
            ? ''
            : imgEl.attr('src').value() ;
          break;
        case 'row_num':
          acc[colKey] = rowIdx;
      }
      return acc;
    }, {});
  });
}

async function getPageContent() {
  let tempPage, pageContent, fileName, tempBrowser;
  fileName = getDocName(EMOJI_STD_URL);
  pageContent = await fileCache.read(fileName);
  if(pageContent === null) {
    console.log('Document not found in cache.\nLoading document from web...');
    tempBrowser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    });
    tempPage = await tempBrowser.newPage();
    tempPage = await loadDocument(tempPage, EMOJI_STD_URL);
    pageContent = await tempPage.content();
    browser = tempBrowser;
    page = tempPage;
    await fileCache.write(fileName, pageContent);
  } else {
    console.log('Page content loaded from cache.');
  }
  return pageContent;
}

async function closeBrowser() {
  if(page) {
    await page.close();
  }
  if(browser) {
    await browser.close();
  }
}

async function loadDocument(page, url) {
  await page.goto(url, {
    waitUntil: 'networkidle0',
    timeout: DEFAULT_PAGE_TIMEOUT
  });
  return page;
}

function getDocName(urlStr) {
  let docStr;
  docStr = urlStr.split('/').pop();
  return docStr;
}
