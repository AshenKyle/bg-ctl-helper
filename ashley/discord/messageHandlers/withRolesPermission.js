const { ADMIN } = require('../../roleNames')

module.exports = ({ handler, roles = [] }) => async ({ discordMsg, discordInterface }) => {
  const rolesToCheck = [...new Set([...roles, ADMIN])]
  if ((discordMsg.member && discordMsg.member.roles.some(r => rolesToCheck.includes(r.name))) || discordMsg.author.id === discordInterface.maintainer.id) {
    await handler({ discordMsg, discordInterface })
  } else {
    discordMsg.channel.send(`Shoo, only members with one of these roles can do that! - ${rolesToCheck.join(", ")}`).then(msg => setTimeout(() => msg.delete(), 5000))
  }
}
