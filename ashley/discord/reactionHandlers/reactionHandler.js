
/**
 * Creates a handler for reactions on a particular message in a particular channel
 * emojiToCallback is a map from emojis to how to handle them, like {Zerg: async () => addRole("Zerg")}
 * disallowedRoleNames optionally filters the handler to only allow certain roles to use them
 * Fatal errors throw exceptions as normal. Async errors (recoverable) are passed to the onError callback, but do not halt the handler
 * Emojis that lack a handler in emojiToCallback are ignored, and do not call onError
 * handlerName can be used to decorate error messages for increased clarity, otherwise a default is generated
 */
module.exports = async ({ handlerName, discordInterface, channelName, messageId, emojiToCallback, disallowedRoleNames = [], onError }) => {
  const decorator = handlerName || `${channelName}_${messageId}`
  
  const channel = discordInterface.server.channels.find("name", channelName)
  if (!channel) throw Error(`Error setting up reactionHandler for '${decorator}': couldn't find channel called '${channelName}'`)

  const emojis = Object.keys(emojiToCallback).map(e => discordInterface.server.emojis.find("name", e).id)
  const message = await roleschannel.fetchMessage(messageId)

  // Initialize message with reactions. This is idempotent
  emojis.forEach(e => message.react(e))

  message.awaitReactions((reaction, user) => {
    // A member has a user, plus metadata about that user like roles and guilds. Users exist on discord. Members exist on servers, like a map from a user to a servers data
    const member = discordInterface.server.members.find("id", user.id)

    if (disallowedRoleNames.any(d => member.roles.find("name", d))) {
      reaction.remove(member)
      return
    }

    const callback = emojiToCallback[reaction.emoji.name]
    if (callback) callback({ message, reaction, member }).catch(e => onError(new Error(`Callback failed for reaction handler '${decorator}' for emoji '${reaction.emoji.name}' and user '${member.user.username}'`)))
  })
}
