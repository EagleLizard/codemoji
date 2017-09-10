let cheerio = require('cheerio');

import cacheLoader from './CacheLoader';

export default class Scraper{

  private $;

  constructor(){

  }

  getParsed():Promise<any>{
    return cacheLoader().then(res=>{
      let $ = cheerio.load('res');
    })
  }
}