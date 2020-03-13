const { ADMIN } = require('../../roleNames')

module.exports = ({ handler, roles = [] }) => async ({ discordMsg, discordInterface }) => {
  const rolesToCheck = [...new Set([...roles, ADMIN])]
  if (!((discordMsg.member && discordMsg.member.roles.some(r => rolesToCheck.includes(r.name))) || discordMsg.author.id === discordInterface.maintainer.id)) {
    await handler({ discordMsg, discordInterface })
  }
}
