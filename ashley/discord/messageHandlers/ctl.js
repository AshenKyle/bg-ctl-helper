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

const letterToRaceIcon = {
  "z": "Zerg",
  "p": "Protoss",
  "t": "Terran",
  "r": "Random",
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
    await auto({ discordInterface, discordMsg })
  }

  if (commandParts[1] === "clear") {
    await clear({ discordInterface, discordMsg })
  }

  if (commandParts[1] === "manual") {
    await manual({ discordInterface, discordMsg })
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

const auto = async ({ discordInterface, discordMsg }) => {
  const msg = await discordMsg.channel.send(`Grabbing player and opponent information, and setting CTL Player role for ${discordMsg.mentions.members.map(m => m.displayName).join(", ")}. I'll delete this message when I'm done...`)
  const ctlPage = await htmlRequest('www.choboteamleague.com', '/home', e => {
    discordMsg.channel.send("Failed to fetch CTL site metadata")
    console.error(`Error while fetching CTL site: ${e}`)
  })

  if (!ctlPage.querySelectorAll('.article-content') || !ctlPage.querySelectorAll('.article-content')[0]) {
    discordMsg.channel.send("It looks like Enjin security is doing it's janky thing again. Use `+ctl manual` instead.")
    await msg.delete()
    return
  }

  let headerNode
  let bgNode
  let isLeftBG
  let childNodes
  try {
    [headerNode, bgNode] = findBGNodesInDom(Array.prototype.slice.call(ctlPage.querySelectorAll('.article-content')[0].childNodes))
    isLeftBG = headerNode.childNodes[1].text.includes("BornG")
    childNodes = bgNode.childNodes.filter(n => ["a", "img", "i"].includes(n.tagName))
  } catch (e) {
    discordMsg.channel.send("It looks like Enjin is returning a garbled response. Use `+ctl manual` instead.")
    await msg.delete()
    return
  }

  const ctlRoom = discordInterface.server.channels.find("name", "ctl")
  const sets = ["Platinum", "Diamond 3", "Diamond 2/3", "Diamond 2/3", "Diamond", "Diamond", "Masters 2/3"]
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

const manual = async ({ discordInterface, discordMsg }) => {
  const currentUserId = discordMsg.author.id

  await discordMsg.channel.send(`
  Alright. First step, go to <http://www.choboteamleague.com/home>, copy everything under the BornG area, then paste it here.
  It should look like this:\`\`\`
  Player1 | Player1#5678 vs. PlayerA | PlayerA#1234  [Deathaura LE]
  Player2 | Player2#5678 vs. PlayerB | PlayerB#1234  [Deathaura LE]
  Player3 | Player3#5678 vs. PlayerC | PlayerC#1234  [Deathaura LE]
  Player4 | Player4#5678 vs. PlayerD | PlayerD#1234  [Deathaura LE]
  Player5 | Player5#5678 vs. PlayerE | PlayerE#1234  [Deathaura LE]
  Player6 | Player6#5678 vs. PlayerF | PlayerF#1234  [Deathaura LE]
  Player7 | Player7#5678 vs. PlayerG | PlayerG#1234  [Deathaura LE]\`\`\`
  I'll wait 60 seconds for you to paste it here :heart:
  Also, I'll ignore everything that doesn't at least contain a \`vs.\`
  `)

  const playerLines = await discordMsg.channel.awaitMessages(m => m.content.includes("vs.") && m.author.id === currentUserId, { max: 1, time: 60000, errors: ["time"] })
    .then(msgs => msgs.map(m => m.content)[0].split("\n").filter(l => l.includes("vs.")))
    .catch(() => discordMsg.channel.send("Hmm I didn't see anything matching after 60 seconds. I'll abort this `ctl manual`.") && false)
  if (!playerLines) return
  if (playerLines.length !== 7) {
    await discordMsg.channel.send(`Ummm... I was expecting 7 matching lines, but I found ${playerLines.length || 0}. Compare what you gave me to the example above and try again.`)
    return
  }

  const sets = ["Platinum", "Diamond 3", "Diamond 2/3", "Diamond 2/3", "Diamond", "Diamond", "Masters 2/3"]
  const errorMsg = playerLines.map((l, i) => {
    if (l.trim().split(" ").length < 7) {
      return `**Problem with set ${i+1} (${sets[i]})** - Something is missing. Here's yours with a correct example below it:\n\`${l}\`\n\`${"Player4 | Player4#5678 vs. PlayerD | PlayerD#1234  [Deathaura LE]"}\``
    }
  
    if (!(l.includes("[") && l.includes("]"))) {
      return `**Problem with set ${i+1} (${sets[i]})** - It looks like the map is not correct. Here's yours with a correct example below it:\n\`${l}\`\n\`${"Player4 | Player4#5678 vs. PlayerD | PlayerD#1234  [Deathaura LE]"}\``
    }
  }).filter(l => l).join("\n")

  if (errorMsg !== "") {
    await discordMsg.channel.send(`I found some issues with that entry:\n\n${errorMsg}\n\nCompare to the example above and try again :heart:`)
    return
  }

  await discordMsg.channel.send(`
  Now I need the races for each matchup (t, p, z, or r). For each of the rows you pasted, enter a row for the races.
  Here's an example:\`\`\`
  zp
  tp
  tz
  rz
  pr
  zt
  pz\`\`\`
  I'll wait 120 seconds for you to enter it :alarm_clock:
  `)
  const raceLines = await discordMsg.channel.awaitMessages(m => m.author.id === currentUserId && m.content.split("\n").length > 1, { max: 1, time: 120000, errors: ["time"] })
    .then(msgs => msgs.map(m => m.content)[0].split("\n").map(l => l.trim().toLowerCase()).filter(l => l.includes("z") || l.includes("t") || l.includes("p") || l.includes("r")))
    .catch(() => discordMsg.channel.send("Hmm I didn't see anything matching after 120 seconds. I'll abort this `ctl manual`.") && false)
  if (!raceLines) return
  if (raceLines.length !== 7) {
    await discordMsg.channel.send(`Ummm... I was expecting 7 matching race lines, but I found ${raceLines.length || 0}. Compare what you gave me to the example above and try again. Use Shift+Enter to separate the lines.`)
    return
  }

  await discordMsg.channel.send("Is Born Gosu on the left or the right? I'll wait 30 seconds.")
  const leftOrRightLine = await discordMsg.channel.awaitMessages(m => m.author.id === currentUserId && m.content.length >= 1, { max: 1, time: 30000, errors: ["time"] })
    .then(msgs => msgs.map(m => m.content)[0].toLowerCase())
    .catch(() => discordMsg.channel.send("Hmm I didn't see anything matching after 30 seconds. I'll abort this `ctl manual`.") && false)
  if (!leftOrRightLine) return
  if (leftOrRightLine[0] !== "l" && leftOrRightLine[0] !== "r") {
    await discordMsg.channel.send(`Ummm... I was expecting \`left\` or \`right\` or \`r\` or something like that, but I found \`${leftOrRightLine}\`. Try again. I believe in you.`)
    return
  }
  const isLeftBG = leftOrRightLine[0] === "l"

  const ctlRoom = discordInterface.server.channels.find("name", "ctl")
  const summaryLines = []
  const embedsToSend = sets.map((set, i) => {
    const lineSegments = playerLines[i].trim().split(" ")
    const bgName = isLeftBG ? lineSegments[0] : lineSegments[4]
    const bgSc2Name = isLeftBG ? lineSegments[2] : lineSegments[6]
    const oppName = isLeftBG ? lineSegments[4] : lineSegments[0]
    const oppSc2Name = isLeftBG ? lineSegments[6] : lineSegments[2]
    const map = playerLines[i].split("[")[1].split("]")[0]
    const bgRaceIcon = isLeftBG ? letterToRaceIcon[raceLines[i][0]] : letterToRaceIcon[raceLines[i][1]]
    const oppRaceIcon = isLeftBG ? letterToRaceIcon[raceLines[i][1]] : letterToRaceIcon[raceLines[i][0]]

    const player = {
      raceIcon: discordInterface.client.emojis.find("name", bgRaceIcon),
      name: bgName,
      sc2name: bgSc2Name,
      link: undefined,
    }
    player.replays = `https://sc2replaystats.com/ladder/search?type=1v1&player=${player.name}`

    const opponent = {
      raceIcon: discordInterface.client.emojis.find("name", oppRaceIcon),
      name: oppName,
      sc2name: oppSc2Name,
      link: undefined,
    }
    opponent.replays = `https://sc2replaystats.com/ladder/search?type=1v1&player=${opponent.name}`

    summaryLines.push(`\`${set}: ${player.name} (${player.sc2name}) vs ${opponent.name} (${opponent.sc2name}) on ${map}\``)

    return {
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
          value: "https://www.choboteamleague.com/home",
          inline: false,
        }, {
          name: "Find their replays to study here",
          value: opponent.replays,
          inline: false,
        }],
      },
    }
  })

  await discordMsg.channel.send(`Here's what I got\n${summaryLines.join("\n")}\n\nType \`yes\` to confirm. I'll wait 120 seconds.`)
  const isConfirmed = await discordMsg.channel.awaitMessages(m => m.author.id === currentUserId && m.content.trim().length > 0, { max: 1, time: 120000, errors: ["time"] })
    .then(msgs => msgs.map(m => m.content)[0].toLowerCase().trim())
    .catch(() => false)
  if (!isConfirmed) {
    await discordMsg.channel.send("Hmm I didn't see anything after 120 seconds. I'll abort this `ctl manual`.")
    return
  }
  if (isConfirmed != "yes") {
    await discordMsg.channel.send("I didn't get a `yes`, so I'll abort this `ctl manual`")
    return
  }

  await discordMsg.channel.send(`Got it. It'll take me a few seconds to send everything...`)

  await embedsToSend.forEach(async (embed, i) => {
    try {
      await ctlRoom.send(embed)
    } catch (e) {
      discordMsg.channel.send(`Something went wrong while I was sending the data to Discord for set ${i+1} (${sets[i]}).\n\n**You'll need to run** \`+ctl manual\` **to clean up what has already worked so far and then try again.**`)
      console.error(`Error during sending embeds from Ctl Manual: ${e}`)
    }
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

  await discordMsg.channel.send(`All done!`)
}
