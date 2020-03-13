import { TRYOUT_MEMBER } from '../roleNames'

const msPerDay = 24 * 60 * 60 * 1000
const bgRGB = [220, 20, 60]
const summaryDisplayName = "Born Gosu Tryout Status"
const daysUntilEligible = 14
const tryoutsPerPage = 4

const numDaysBetween = (d1, d2) =>
  Math.floor((Date.parse(d1) - Date.parse(d2)) / msPerDay)
const prettyDate = d => d.toString().split(" ").slice(1,4).join(" ") // eg: Jan 4 2020

export default async ({ dbInterface, discordInterface }) => {
  return {
    reset: async () => {
      dbInterface.removeAll()
      const tryouts = discordInterface.users.tryouts.map(member => {
        const member = discordInterface.users.all.find("id", member.id)
        return {
          "id": member.id,
          "tag": member.user.tag,
          "joindate": member.joinedAt,
          "tryoutsince": ""
        }
      })

      await dbInterface.insert(tryoutMembers)
    },
    add: async ({ id, user, joinedAt }) => {
      await dbInterface.insert({
        id,
        tag: user.tag,
        joindate: joinedAt,
        tryoutsince: new Date(Date.now())
      })
    },
    remove: async ({ id }) => await dbInterface.remove({ id }),
    status: async ({ author }) => {
      // Custom tryout data is in a separate database; basic data is in discord (up to date, but can drift)
      const dbTryouts = await dbInterface.findAll() // source of truth
      const discordTryouts = discordInterface.users.tryouts // can drift from source of truth

      // Merge the db data and the discord data for each tryout
      const tryoutMeta = discordTryouts
        .map(tryout => {
          const dbTryout = dbTryouts.find(t => t.id === tryout.user.id)
          if (!dbTryout) return undefined // database considered the source of truth, since role can come from many sources, db only from tryout commands

          const now = new Date(Date.now())
          const tryoutStartDate = new Date(tryout.tryoutsince)
          const daysAsTryout = numDaysBetween(now, tryoutStartDate)
          const daysOnServer = numDaysBetween(now, tryout.joinedAt)
          return {
            tag: tryout.user.tag,
            oldTag: dbTryout.oldTag,
            joinedAt: tryout.joinedAt, // for display only
            tryoutSince: tryoutStartDate, // for promotion eligibility
            daysAsTryout, // for sorting
            daysOnServer, // for display
            isEligibleForPromotion: daysAsTryout >= 14,
          }
        })
        .filter(m => m)
        .sort((m1, m2) => m2.daysAsTryout - m1.daysAsTryout)

      if (tryoutMeta.length === 0) {
        discordInterface.client.send("Looks like there are no tryouts. Time to recruit!")
        return
      }

      const pages = tryoutMeta.reduce((acc, t) => {
        // First make sure an non-full page is available to accept this tryout
        if (acc.length === 0) {
          // First page always exists, and contains a special display title via the "setAuthor" decoration
          acc.push(new Discord.RichEmbed().setAuthor(summaryDisplayName, server.iconURL).setColor(bgRGB))
        } else {
          if (acc[acc.length-1].length === tryoutsPerPage) {
            acc.push(new Discord.RichEmbed().setColor(bgRGB))
          }
        }

        // We always add to the last page, which we know has room already
        const lastPage = acc[acc.length - 1]
        lastPage
          .addField(
            `${t.tag}${t.tag !== t.oldTag ? ` (former tag: ${t.oldTag})` : ""}`,
            `__Joined Server:__ ${prettyDate(t.joinedAt)} (${t.daysOnServer} Days ago)\n`,
          )
          .addField(
            `**Tryout since:** ${prettyDate(t.tryoutSince)} (${t.daysAsTryout} Days)\n`,
            t.isEligibleForPromotion ? ":white_check_mark: **__eligible for Promotion/Demotion__**" : ":x: Not yet eligible for Promotion/Demotion"
          )
          .addBlankField()
      }, [])

      pages.forEach((page, index) => {
        page.setFooter(`Page ${index + 1}/${pages.length}`)
        discordInterface.client.send(page)
      })
    }
  }
}
