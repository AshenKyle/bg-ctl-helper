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
      "Cookie": "",
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
