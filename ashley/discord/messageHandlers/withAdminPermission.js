const { ADMIN } = require('../../roleNames')

module.exports = ({ handler }) => async ({ discordMsg, discordInterface }) => {
  if ((discordMsg.member && discordMsg.member.roles.find('name', ADMIN)) || discordMsg.author.id === discordInterface.maintainer.id) {
    await handler({ discordMsg, discordInterface })
  } else {
    discordMsg.channel.send("Shoo, only Admins can do that!").then(msg => setTimeout(() => msg.delete(), 5000))
  }
}
