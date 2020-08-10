const htmlRequest = require('../../http/htmlRequest')
const { CTLPLAYERS } = require('../../roleNames')

const findBGNodesInDom = nodes => {
  return nodes[1].rawText.includes("BornG") ? [nodes[1], nodes[3]] : findBGNodesInDom(nodes.slice(4))
}

const imageUrlToRaceIcon = {
  "http://i.imgur.com/HRNlj.png": "Zerg",
  "http://i.imgur.com/lY0rg.png": "Protoss",
  "http://i.imgur.com/PZaHh.png": "Terran",
  "https://i.imgur.com/y6wDt.png": "Random",
}

module.exports = async ({ discordInterface, discordMsg }) => {
  const commandParts = discordMsg.content.substring(1).split(" ")

  if (!commandParts[1]) {
    discordMsg.channel.send(`Usage:
    \`+ctl clear\`
        Removes messages and topics from the ctl channel and removes
        the CTL Player role from everyone.
    \`+ctl auto @player1 @player2 ... @player7\`
        Automatically grabs the player and opponent info and prints it out.
        Prints an onboarding for the players as well.
        **Mentions are only needed to set the CTL Player role - not using them
        will still work but you'll have to add the tag manually.**
        Uses data from <https://www.choboteamleague.com/home>.
        If that site is not working, use \`+ctl manual\`.
    \`+ctl manual\`
        Lets you manually configure the next match printouts. Only use
        this if \`+ctl auto\` is not working.
    `)
  }

  if (commandParts[1] === "auto") {
    await intro({ discordInterface, discordMsg })
  }

  if (commandParts[1] === "clear") {
    await clear({ discordInterface, discordMsg })
  }

  if (commandParts[1] === "manual") {
    const msg = await discordMsg.channel.send(`Not yet implemented`)
  }
}

const clear = async ({ discordInterface, discordMsg }) => {
  const msg = await discordMsg.channel.send(`Removing ctl roles and clearing ctl channel. This may take a while if there are many messages, but I'll remove this message when I'm done...`)
  const ctlRoleID = discordInterface.server.roles.find("name", CTLPLAYERS).id
  const membersWithRoleRemoved = []
  await discordInterface.server.roles.get(ctlRoleID).members.forEach(async ({ id }) => {
    const member = discordInterface.server.members.find("id", id)
    await member.removeRole(ctlRoleID)
    membersWithRoleRemoved.push(member.displayName)
  })
  if (membersWithRoleRemoved.length > 0) {
    discordMsg.channel.send(`Removed CTL Player role from: ${membersWithRoleRemoved.join(", ")}`)
  }

  const ctlRoom = discordInterface.server.channels.find("name", "ctl")
  await deleteAllMsgs({ room: ctlRoom, limit: 100 })
  await ctlRoom.setTopic("cleared")
  await msg.delete()
}

const deleteAllMsgs = async ({ room, limit, count = 0 }) => {
  const msgs = await room.fetchMessages({ limit })
  if (msgs.size > 0) {
    await room.bulkDelete(msgs)
  }
  if (msgs.size === limit && count < 20) {
    await deleteAllMsgs({ room, limit, count: count++ })
  }
}

const intro = async ({ discordInterface, discordMsg }) => {
  const msg = await discordMsg.channel.send(`Grabbing player and opponent information, and setting CTL Player role for ${discordMsg.mentions.members.map(m => m.displayName).join(", ")}. I'll delete this message when I'm done...`)
  const ctlPage = await htmlRequest('www.choboteamleague.com', '/home', e => {
    discordMsg.channel.send("Failed to fetch CTL site metadata")
    console.log(`Error while fetching CTL site: ${e}`)
  })

  const ctlRoom = discordInterface.server.channels.find("name", "ctl")
  if (!ctlPage.querySelectorAll('.article-content') || !ctlPage.querySelectorAll('.article-content')[0]) {
    discordMsg.channel.send("It looks like Enjin security is doing it's janky thing again. You'll have to get Physics to run a cookie bypass, or bribe him to impliment manual mode.")
    await msg.delete()
    return
  }
  const [headerNode, bgNode] = findBGNodesInDom(Array.prototype.slice.call(ctlPage.querySelectorAll('.article-content')[0].childNodes))
  const isLeftBG = headerNode.childNodes[1].text.includes("BornG")
  const childNodes = bgNode.childNodes.filter(n => ["a", "img", "i"].includes(n.tagName))

  const sets = ["Platinum", "Platinum", "Diamond 2/3", "Diamond 2/3", "Diamond", "Diamond", "Masters 2/3"]
  const setsAndPlayers = [] // for display later on
  await sets.forEach(async (set, i) => {
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

    setsAndPlayers.push({player: player.name, set }) // used for display afterwards

    await ctlRoom.send({
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

  const ctlRoleID = discordInterface.server.roles.find("name", CTLPLAYERS).id
  await discordMsg.mentions.members.map(async m => {
    await m.addRole(ctlRoleID)
  })

  await ctlRoom.send(`**Welcome to the new CTL week!**
${discordMsg.mentions.members.map(m => `${m} `)}
This is a private channel for ctl players to schedule and plan for their matches.

**Schedule your match:** You guys have to PM your opponents via the link above and set up a fixed time and day for your match including the timezone. Keep us updated as you contact your opponent, and when you agree on a time or are having difficulties.

**Scout your opponent:** Also above are links to replays of your opponents. Try to determine what style your opponent favors, whether they like macro, all-inns, or cheeses. Prepare for your opponent specifically.

**Practice**: Ask for help and practice from clanmates (here or in #bg-khala, not in non-member channels).

**Use "No Match History":** While playing customs, make sure to use "No Match History" so your builds aren't scouted.

**Play the game:** Play to win. But play for fun. We're going to love you regardless of the result.

**Report the outcome:** DM your replay to the CTL captain, but keep the result private in case we cast your games.
  `)

  await ctlRoom.setTopic(`
${setsAndPlayers[0].set} - ${setsAndPlayers[0].player}
${setsAndPlayers[1].set} - ${setsAndPlayers[1].player}
${setsAndPlayers[2].set} - ${setsAndPlayers[2].player}
${setsAndPlayers[3].set} - ${setsAndPlayers[3].player}
${setsAndPlayers[4].set} - ${setsAndPlayers[4].player}
${setsAndPlayers[5].set} - ${setsAndPlayers[5].player}
${setsAndPlayers[6].set} - ${setsAndPlayers[6].player}
  `)

  await msg.delete()
}
