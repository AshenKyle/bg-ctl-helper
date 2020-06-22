const htmlRequest = require('../../http/htmlRequest')

const findBGNodesInDom = nodes => {
  return nodes[1].rawText.includes("BornG") ? [nodes[1], nodes[3]] : findBGNodeInDom(nodes.slice(4))
}

const imageUrlToRaceIcon = {
  "http://i.imgur.com/HRNlj.png": "Zerg",
  "http://i.imgur.com/lY0rg.png": "Protoss",
  "http://i.imgur.com/PZaHh.png": "Terran",
  "https://i.imgur.com/y6wDt.png": "Random",
}

module.exports = async ({ discordInterface, discordMsg }) => {
  const commandParts = discordMsg.content.substring(1).split(" ")
  if (commandParts[1] === "publish") {
    discordMsg.channel.send(`Not yet implemented`)
    return
  } else {
    discordMsg.channel.send(`Showing output here... use \`ctl publish\` to send it to the ctl room instead (it will ping players)`)
  }

  const ctlPage = await htmlRequest('www.choboteamleague.com', '/home', e => {
    discordMsg.channel.send("Failed to fetch CTL site metadata")
    console.log(`Error while fetching CTL site: ${e}`)
  })

  const [headerNode, bgNode] = findBGNodesInDom(Array.prototype.slice.call(ctlPage.querySelectorAll('.article-content')[0].childNodes))
  const isLeftBG = headerNode.childNodes[1].text.includes("BornG")
  const childNodes = bgNode.childNodes.filter(n => ["a", "img", "i"].includes(n.tagName))

  const sets = ["Platinum", "Platinum", "Diamond 2/3", "Diamond 2/3", "Diamond", "Diamond", "Masters 2/3"]
  sets.forEach((set, i) => {
    const bgRaceIndex = (isLeftBG ? 0 : 3) + 5 * i
    const bgNameIndex = (isLeftBG ? 1 : 2) + 5 * i
    const oppRaceIndex = (isLeftBG ? 3 : 0) + 5 * i
    const oppNameIndex = (isLeftBG ? 2 : 1) + 5 * i
    const mapIndex = 4 + 5 * i

    const player = {
      raceIcon: discordInterface.client.emojis.find("name", imageUrlToRaceIcon[childNodes[bgRaceIndex].getAttribute("src")]),
      race: imageUrlToRaceIcon[childNodes[bgRaceIndex].getAttribute("src")],
      name: childNodes[bgNameIndex].text.split(" | ")[0],
      sc2name: childNodes[bgNameIndex].text.split(" | ")[1],
      link: childNodes[bgNameIndex].getAttribute("href"),
    }
    player.replays = `https://sc2replaystats.com/ladder/search?type=1v1&player=${player.name}`

    const opponent = {
      raceIcon: discordInterface.client.emojis.find("name", imageUrlToRaceIcon[childNodes[oppRaceIndex].getAttribute("src")]),
      race: imageUrlToRaceIcon[childNodes[oppRaceIndex].getAttribute("src")],
      name: childNodes[oppNameIndex].text.split(" | ")[0],
      sc2name: childNodes[oppNameIndex].text.split(" | ")[1],
      link: childNodes[oppNameIndex].getAttribute("href"),
    }
    opponent.replays = `https://sc2replaystats.com/ladder/search?type=1v1&player=${opponent.name}`

    const map = childNodes[mapIndex].text.slice(1).slice(0, -1)

    discordMsg.channel.send({
      embed: {
        title: `${set} Set`,
        fields: [{
          name: `${player.raceIcon} ${player.name}`,
          value: player.sc2name,
          inline: true,
        }, {
          name: `${opponent.raceIcon} ${opponent.name}`,
          value: opponent.sc2name,
          inline: true,
        }, {
          name: "Map",
          value: map,
          inline: true,
        }, {
          name: "Schedule your match here",
          value: opponent.link,
          inline: false,
        }, {
          name: "Find their replays to study here",
          value: opponent.replays,
          inline: false,
        }],
      },
    })
  })
}
