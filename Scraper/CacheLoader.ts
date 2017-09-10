let fs = require('fs');
let q = require('q');
let tinyreq = require('tinyreq');

import {CONSTANTS} from '../constants';

const CACHE_LIMIT_MS = 1000 * 60 * 60 * 24;

export default function cacheLoader():Promise<any>{
  let deferred;
  deferred = q.defer();
  if(doCache()){
    console.log('Loading from cache...\n');
    fs.readFile(CONSTANTS.CACHED_FILE, (err,data)=>{
      if(err) throw err;
      deferred.resolve(data);
    });
  }else{
    console.log('Loading from website...\n');
    tinyreq(CONSTANTS.STANDARD_URL).then(res=>{
      deferred.resolve(res);
      fs.writeFile(CONSTANTS.CACHED_FILE, res, err=>{
        if(err) throw err;
      })
    });
  }
  return deferred.promise;
}

function doCache():boolean{
  let metaExists, fileExists, cacheMeta, result, cacheDiff;
  result = false; 
  metaExists = fs.existsSync(CONSTANTS.CACHE_META);
  fileExists = fs.existsSync(CONSTANTS.CACHED_FILE);
  if(metaExists && fileExists){
    cacheMeta = JSON.parse(fs.readFileSync(CONSTANTS.CACHE_META));
    cacheDiff = (new Date()).getTime() - cacheMeta.lastCache;
    if(cacheDiff < CACHE_LIMIT_MS){
      result = true;
    }
  }else{
    result = false;
  }
  if(!result){
    fs.writeFileSync(CONSTANTS.CACHE_META, JSON.stringify({
      lastCache: new Date().getTime()
    }));
  }
  return result;
}