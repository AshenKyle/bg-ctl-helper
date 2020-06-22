const https = require('https')
const parse = require('node-html-parser').parse


module.exports = async (host, path, onError) => new Promise((resolve, reject) =>
  https.get({
    host,
    path,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)",
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
