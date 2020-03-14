const RequestPromise = require('request-promise')
const $ = require('cheerio')

module.exports = async ({ discordInterface, discordMsg }) => {
  const commandParts = discordMsg.content.substring(1).split(" ")
  const searchingMessage = discordMsg.channel.send(`Searching for '${commandParts[1] || ""}' ...`)

  fetchUsers(commandParts[1], async results => {
    const outputLines = results.reduce((acc, result) => {
      if (acc[acc.length - 1].length +230 > 2000) {
        acc.push("")
      }

      const league = result.league[0].toUpperCase() + result.league.substr(1, result.league.length)
      const race = result.race[0].toUpperCase() + result.race.substr(1, result.race.length)

      acc[acc.length - 1] +=
        "\:flag_" + result.region.toLowerCase() + ": " +
        "**" + result.ign + "** " +
        discordInterface.client.emojis.find("name", league.split(" ")[0]) + league + " (" + result.mmr + " MMR) " +
        discordInterface.client.emojis.find("name", race) + race + ", " +
        ((result.winRatioGames !== undefined) ? result.winRatioGames : "N/A") + " (" + result.winRatioPercentage + " Win rate) " + "\n" +
        result.sc2Link + "\n\n"
      
        return acc
    }, [""])

    if (outputLines.length === 0) {
      outputLines.push(`No player found with the name: '${command[1]}'`)
    }

    await searchingMessage.then(msg => msg.delete())
    outputLines.forEach(line => discordMsg.channel.send(line))
  })
}

const fetchUsers = async (user, callback) => RequestPromise(`http://sc2unmasked.com/Search?q=${user}`)
  .then(html => {
    let playersFound = []
    let results = $('tbody > tr > td.rank', html).toArray()
    results.forEach(result => {
      if (result.children[0].attribs.alt) {
        const region = result.children[0].attribs.alt.trim().toUpperCase()
        const league = result.children[1].attribs.alt.trim()
        const race = result.next.children[0].attribs.alt.trim()
        const bnetLink = result.next.next.next.children[2].attribs.href.trim()
        const ign = result.next.next.next.children[2].children[0].data
        const mmr = result.next.next.next.next.children[0].data
        const winRatioPercentage = result.next.next.next.next.next.children[0].data
        const winRatioGames = result.next.next.next.next.next.next.children[0].data
        const sc2Link = (result.next.next.next.next.next.next.next.next.next.children[0] !== undefined)
          ? result.next.next.next.next.next.next.next.next.next.children[0].attribs.href
          : "_No sc2replaystats linked_"
          ;
        
        playersFound.push({
          'ign': ign,
          'league': league,
          'race': race,
          'mmr': mmr,
          'region': region,
          'bnetLink': bnetLink,
          'winRatioPercentage': winRatioPercentage,
          'winRatioGames': winRatioGames,
          'sc2Link': sc2Link,
        })
      }
    })
    callback(playersFound);
  })
