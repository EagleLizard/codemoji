const fs = require('fs');

let cheerio = require('cheerio');

import cacheLoader from './CacheLoader';

const HEADER_ROW_IDX:number = 2;

export default class Scraper{

  rows:any;

  constructor(){

  }

  getParsed():Promise<any>{
    return cacheLoader().then(res=>{
      let $ = cheerio.load(res);
      let foundRows = $($(`div.main table`).get(0)).find('tr');
      this.rows = [];
      for(var i = 0; i < foundRows.length; ++i){
        this.rows.push(parseFoundRow(foundRows[i].children));
      }
      let headerRow = this.rows[HEADER_ROW_IDX];
        // .filter(cell=>cell.children)
        // .map(cell=>return cell.children[0].children[0].data});
      // fs.writeFile('./json_data.json', JSON.stringify(this.rows), err=>{
      //   if(err) throw err;
      // });
      console.log(headerRow);
      console.log('firstFoundRow:');
      console.log(parseFoundRow(this.rows[HEADER_ROW_IDX+1]));
    });
  }

  
}

//pure
function parseFoundRow(foundRow):string[]{
  let result;
  foundRow = foundRow.filter(cell=>cell.type==='tag');
  if(foundRow[0].name === 'th'){
    console.log(foundRow[0]);
    result = parseHeaderRow(foundRow);
  }else{
    result = parseContentRow(foundRow);
  }
  return result;
    
}

function parseHeaderRow(row){
  return row
    .filter(cell=>cell.children)
    .map(cell=>cell.children[0].children[0].data);
}

function parseContentRow(row){
  return row.map(cell=>{
    let data;
    cell = cell.children[0];
    if(cell.name === 'img'){
      data = cell.attribs.src;
    }else{
      data = cell.data
    }
    return data;
  });
}