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
      "Cookie": "__cfduid=da0f46f1715b88567a76c755c8166cd291596419810; lastviewed=1596419810; enjin_browsertype=web; __cf_bm=9f58fd1cd4c502d8cb1651a452086a0c3271cb53-1596419810-1800-AXkr+kInzD9qHHKvTpzzXyb6j3GOZ3LoD4E+C1mj0F4nfTeMF6+ZDJJhrbS2g161loVDIR+OTaoOhOvODBeXBio=; _ga=GA1.2.2098343159.1596419812; _gid=GA1.2.19425796.1596419812; __qca=P0-1055921824-1596419816321",
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
