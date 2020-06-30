module.exports = async ({ discordInterface, discordMsg }) => {
  discordMsg.reply([
    "Ctl capabilities: DONE",
    "League capabilities: PENDING",
    "Race capabilities: PENDING",
    "Other role capabilities: PENDING",
    "Tryout capabilities: PENDING",
    "Error handling capabilities: DONE",
    "Sellout capabilities: DONE",
    "Alfred interactions: PENDING",
    "Permission capabilities: DONE",
    "Search capabilities: DONE",
  ].join("\n"))
}
