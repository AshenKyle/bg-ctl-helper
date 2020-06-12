const RequestPromise = require('request-promise')

const regionToCode = {
  US: 1,
  EU: 2,
  KR: 3,
  CN: 5,
}

module.exports = async ({ discordInterface, discordMsg }) => {
  const commandParts = discordMsg.content.substring(1).split(" ")
  const searchingMessage = discordMsg.channel.send(`Searching for '${commandParts[1] || ""}' ...`)

  const rawResult = await RequestPromise(`https://www.sc2ladder.com/api/player?query=${commandParts[1]}`)
  const results = rawResult ? JSON.parse(rawResult) : []

  const playerSummaries = results.reduce((lines, { rank, mmr, race, username, alias, region, realm, clan, wins = 0, losses = 0, profile_id }) => {
    const rankEmoji = discordInterface.client.emojis.find("name", rank)
    const raceEmoji = discordInterface.client.emojis.find("name", race)
    const regionEmoji = `\:flag_${region.toLowerCase()}:`
    const clanNameAlias = `${clan ? `[${clan}] ` : ""}${username}${alias ? ` (aka ${alias})` : ""}`
    const winRatio = `W/L: ${wins}/${losses}`
    const sc2Link = regionToCode[region] ? `Profile: <https://starcraft2.com/en-gb/profile/${regionToCode[region]}/${realm}/${profile_id}>` : `Unknown region: ${region}`
    const replaysLink = `Replays(check all regions): <https://sc2replaystats.com/ladder/search?type=1v1&player=${commandParts[1]}>`

    return [...lines, `${regionEmoji}**${clanNameAlias}**${raceEmoji}${rankEmoji}(${mmr} MMR) ${winRatio}\n${sc2Link}\n${replaysLink}`]
  }, [])

  await searchingMessage.then(msg => msg.delete())

  if (playerSummaries.length === 0) {
    discordMsg.channel.send(`No player found with the name: '${commandParts[1]}'\nYou might find some older replays here (try different seasons and regions):\n<https://sc2replaystats.com/ladder/search?type=1v1&player=${commandParts[1]}>`)
  } else {
    discordMsg.channel.send(`Found ${playerSummaries.length} matching profiles. Showing 5 at a time:`)
    groupBy5(playerSummaries).forEach(s => discordMsg.channel.send(s))
  }
}

const groupBy5 = (remaining, msgs = []) => {
  if (remaining.length === 0) {
    return msgs
  }

  const next5 = `${remaining.slice(0, 5).join("\n\n")}\n_(${remaining.slice(5).length} remaining...)_\n`
  return groupBy5(remaining.slice(5), [...msgs, next5])
}
