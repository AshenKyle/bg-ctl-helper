const https = require('https')
const parse = require('node-html-parser').parse


module.exports = async (host, path, onError) => new Promise((resolve, reject) =>
  https.get({
    host,
    path,
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:77.0) Gecko/20100101 Firefox/77.0",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Cookie": "__cfduid=daeebf0a8ba2ef373b11a3914151316c91593543019; __cf_bm=5c50a3e4e47be2e42be1c71a3c5e3328fd582e15-1593543019-1800-ATS69m7hnVMU66bfmCtNuZfOsAmvoayPOSGL2jRwTsfaz7EnTqM/aXZsq1UsCSlkzVa9Haab7znbdUJyc0yoNmE=; cf_clearance=c06cc8627582f4a2bb2091c9dd07eaf288c9d2b7-1593543019-0-1za95986cdzd2cd5969zeca80ce2-150; lastviewed=1593543020; enjin_browsertype=web; _ga=GA1.2.1546110371.1593543050; _gid=GA1.2.1072091630.1593543050; __cf_bm=66b3cefc6d62d9066358e5c6a7ec9e671b0f9e29-1593544143-1800-AY36vr38m9Y4v2RA2dPHrsD8D9xSXfeg+wJ7nHIav9xXTjHKPSBQNvBcA1A89Q8uEPSBlszki2BRnDf2dxewza8=; cf_clearance=70b11fa30759f5244222de3b3e0d0d83dce36e7c-1593544059-0-1zbfc13cf7zd2cd5969zeca80ce2-150; __qca=P0-1519892338-1593544061961",
    },
  }, r => {
    let html = ''
    r.on('data', c => html += c)
    r.on('end', () => resolve(parse(html)))
  }).on("error", e => {
    onError(e.message)
    reject(e.message)
  })
)
