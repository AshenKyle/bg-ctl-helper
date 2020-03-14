module.exports = async ({ discordInterface, discordMsg }) => {
  discordMsg.reply([
    "Vitals: NOMINAL",
    "Brain Activity: NORMAL",
    "Ctl capabilities: PENDING",
    "League capabilities: PENDING",
    "Race capabilities: PENDING",
    "Other role capabilities: PENDING",
    "Social capabilities: PENDING",
    "Tryout capabilities: PENDING",
    "Error handling capabilities: DONE",
    "Sellout capabilities: DONE",
    "Alfred capabilities: PENDING",
    "Allstar capabilities: PENDING",
    "Impatience capabilities: PENDING",
    "Permission capabilities: PENDING",
    "Search capabilities: DONE",
    "Best friend position: TAKEN",
  ].join("\n"))
}
