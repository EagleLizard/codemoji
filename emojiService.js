
module.exports = {
  search,
};

function search(searchStr) {
  let foundEmojis;
  foundEmojis = emojiArr.filter(emoji => {
    let searchKeys;
    searchKeys = emoji.cldr_short_name.split(' ');
    return searchKeys.findIndex(searchKey => {
      return searchKey === searchStr;
    });
  });
  return foundEmojis;
}
