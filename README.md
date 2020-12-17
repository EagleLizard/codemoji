# codemoji
Web scraper to get aggregate descriptive and image data from the Emoji Standards website.

## Installation
```shell
$ npm i
```

## Usage
### Scrape and Build emoji metadata
```sh
$ node main.js
```

### search emoji
After running the scraper, you can search the locally stored metadata like so:
```sh
$ node main.js -s heart
argv.s: heart
🥰 😍 😻 💘 💝 💖 💗 💓 💞 💕 💟 ❣ 💔 ❤ 🧡 💛 💚 💙 💜 🤎 🖤 🤍 🫀 💑 👩‍❤️‍👨 👨‍❤️‍👨 👩‍❤️‍👩 ♥
```