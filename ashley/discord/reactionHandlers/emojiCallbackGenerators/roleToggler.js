module.exports = ({ roleName, isMutuallyExclusive = false }) => async ({ message, reaction, member }) => {
  if (member.roles.find("name", roleName) !== null) {
    member.removeRole(roles.find("name", roleName).id);
    reaction.remove(member);
  } else {
    member.addRole(roles.find("name", roleName).id)
    leagueTags.forEach(league => {
      if (roleName !== league) {
        member.removeRole(roles.find('name', league).id)
      }
    });

    if (isMutuallyExclusive) {
      message.reactions.forEach(r => roleName !== r.emoji.name && r.remove(member))
    }
  }
}
