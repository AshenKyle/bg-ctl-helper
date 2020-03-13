const MongoInterface = require('./tryout/db/mongoInterface')
const DiscordInterface = require('./discord/discordInterface')
const ReactionHandler = require('./discord/reactionHandlers/reactionHandler')
const RoleToggler = require('./discord/reactionHandlers/emojiCallbackGenerators/roleToggler')
const MessageRouter = require('./discord/messageRouter')

module.exports = async config => {
  const dbInterface = MongoInterface({ user: config.dbUser, password: config.dbPassword, port: config.dbPort, dbName: config.dbName, collectionName: config.collectionName })

  const discordInterface = await DiscordInterface({
    botToken: config.botToken,
    serverName: config.serverName,
    botName: config.botName,
    maintainerId: config.maintainerId,
    prefix: config.prefix,
  })

  const onError = e => discordInterface.maintainer.send(e.toString())

  const messageRouter = await MessageRouter({ discordInterface, prefix: config.prefix, onError })
  discordInterface.client.on("message", messageRouter)


  // const leagueRoles = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"]
  // await ReactionHandler({
  //   handlerName: "League Handler",
  //   channelName: "channels-roles-faq",
  //   messageId: isDev ? "602559407137751053" : "466648570116702208",
  //   discordInterface,
  //   disallowedRoleNames: ["Non-Born Gosu"],
  //   onError,
  //   emojiToCallback: leagueRoles.reduce((acc, r) => ({ ...acc, [r]: RoleToggler({ roleName: r, isMutuallyExclusive: true })}), {})
  // })
}
