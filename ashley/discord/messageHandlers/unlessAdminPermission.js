const { ADMIN } = require('../../roleNames')

module.exports = ({ handler }) => async ({ discordMsg, discordInterface }) => {
  if (!((discordMsg.member && discordMsg.member.roles.find('name', ADMIN)) || discordMsg.author.id === discordInterface.maintainer.id)) {
    await handler({ discordMsg, discordInterface })
  }
}
