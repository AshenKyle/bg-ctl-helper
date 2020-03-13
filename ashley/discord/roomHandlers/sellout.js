module.exports = async ({ discordInterface, discordMsg }) => {
  if (discordMsg.attachments.size === 0) {
    discordMsg.channel.send("Please only post images in this channel!").then(msg => setTimeout(() => msg.delete(), 5000))
    discordMsg.author.send("Your message in #s-e-l-l-o-u-t got deleted, because that channel should only be used for showcasing Born Gosu merchandise!\n\"" + discordMsg.content + "\"")
    discordMsg.delete()
  }
}
