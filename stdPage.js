
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

const puppeteer = require('puppeteer');

const EMOJI_STD_URL = 'https://unicode.org/emoji/charts/full-emoji-list.html';
const CACHE_PREFIX = 'cached__';
const DEFAULT_PAGE_TIMEOUT = 3e5;

let browser, page;

module.exports = {
  getPage,
  closeBrowser
};

async function getPage() {
  let tempPage, pageContent, fileName, tempBrowser,
    cachedFilePath, cachedFileExists;
  tempBrowser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
  });
  tempPage = await tempBrowser.newPage();
  tempPage.setDefaultTimeout(DEFAULT_PAGE_TIMEOUT);
  fileName = `${CACHE_PREFIX}${getDocName(EMOJI_STD_URL)}`;
  cachedFilePath = path.resolve(__dirname, fileName);
  console.log('Checking if document is already cached...');
  console.log(cachedFilePath);
  cachedFileExists = await exists(cachedFilePath);
  if(cachedFileExists) {
    console.log('Cached file found, loading from disk...');
    tempPage = await loadDocumentFromFile(tempPage, cachedFilePath);
  } else {
    console.log('Document not found in cache.\nLoading document from web...');
    tempPage = await loadDocument(tempPage, EMOJI_STD_URL);
    pageContent = await tempPage.content();
    await writeFile(cachedFilePath, pageContent);
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

async function loadDocumentFromFile(page, filePath) {
  let content;
  content = (await readFile(filePath)).toString();
  try {
    await page.setContent(content, {
      timeout: 3e5
    });
  } catch(e) {
    console.error(e);
    throw new Error('Error loading document from local file');
  }

  return page;
}

async function loadDocument(page, url) {
  await page.goto(url, {
    waitUntil: 'networkidle0'
  });
  return page;
}

function getDocName(urlStr) {
  let docStr;
  docStr = urlStr.split('/').pop();
  return docStr;
}

async function exists(filePath) {
  try {
    await access(filePath, fs.constants.F_OK);
  } catch(e) {
    return false;
  }
  return true;
}
