
const puppeteer = require('puppeteer');

const fileCache = require('./file-cache');

const EMOJI_STD_URL = 'https://unicode.org/emoji/charts/full-emoji-list.html';
const DEFAULT_PAGE_TIMEOUT = 3e6;

let browser, page;

module.exports = {
  getPage,
  closeBrowser
};

async function getPage() {
  let tempPage, pageContent, fileName, tempBrowser;
  tempBrowser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
  });
  tempPage = await tempBrowser.newPage();
  fileName = getDocName(EMOJI_STD_URL);
  pageContent = await fileCache.read(fileName);
  if(pageContent === null) {
    console.log('Document not found in cache.\nLoading document from web...');
    tempPage = await loadDocument(tempPage, EMOJI_STD_URL);
    pageContent = await tempPage.content();
    await fileCache.write(fileName, pageContent);
  } else {
    console.log('Cached file found, loading from disk...');
    await tempPage.setContent(pageContent.toString(), {
      timeout: 3e5
    });
  }
  browser = tempBrowser;
  page = tempPage;
  console.log('Document loaded.');
  return page;
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
