const Discord = require('discord.js')
const { TRYOUT_MEMBER } = require('../roleNames')
const { BOT_CHANNEL } = require('../channelNames')

module.exports = async ({ botToken, serverName, botName, maintainerId, prefix }) => {
  const client = new Discord.Client()
  await new Promise(resolve => {
    client.on("ready", resolve)
    client.login(botToken)
  })

  // client.on("guildMemberRemove", (member) => { })

  client.user.setUsername(botName)
  client.user.setActivity("CTL Simulator", { type: "PLAYING"})
  const server = client.guilds.find("name", serverName)

  let maintainer
  const botChannel = server.channels.find("name", BOT_CHANNEL)
  if (maintainerId) {
    maintainer = client.users.find("id", maintainerId)
    maintainer.send(`${botName} started. You are the current maintainer. Current prefix is '${prefix}'. Current server name is '${serverName}'`)
  } else {
    maintainer = botChannel
    maintainer.send(`${botName} started. Current maintainer couldn't be found - using this channel instead. Current prefix is '${prefix}'. Current server name is '${serverName}'`)
  }

  return {
    client,
    server,
    users: {
      all: server.members,
      tryouts: server.roles.get(server.roles.find("name", TRYOUT_MEMBER).id).members.array()
    },
    maintainer,
  }
}

// client.on("ready", () => {
//   channel = server.channels.find("name", "ctl");

//   // SELF ASSIGNABLE ROLES
//   let roles = server.roles;
//   let roleschannel = server.channels.find("name", "channels-roles-faq");
//   let emojis = server.emojis;
//   raceTags = ["Terran", "Protoss", "Zerg", "Random"];
//   let raceTagMessage;
//   leagueTags = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"];
//   let leagueTagMessage;
//   otherTags = ["Coop", "Osu", "Pathofexile"];
//   let otherTagMessage;

//   // Race
//   roleschannel.fetchMessage('466648565415018507').then(message => {
//       raceTagMessage = message;
//       raceTags.forEach(race => {
//           try {
//               message.react(emojis.find("name", race).id);
//           } catch (e) { Maintainer.send(e.toString()); }
//       });
//       message.awaitReactions((r, u) => {
//           let reaction = r._emoji.name;
//           let user = server.members.find("id", u.id);
//           if(user.roles.find("name", "Non-Born Gosu") !== null) {
//               r.remove(user);
//               return;
//           }
//           reaction = reaction[0].toUpperCase() + reaction.substr(1).toLowerCase();
//           if (raceTags.includes(reaction)){
//               try {
//                   if(user.roles.find("name", reaction) !== null){
//                       user.removeRole(roles.find("name", reaction).id);
//                       r.remove(user);
//                   } else {
//                       user.addRole(roles.find("name", reaction).id);
//                   }
//               } catch (e) { Maintainer.send(e.toString()); }
//           }
//       });
//   }).catch(console.error);

//   // League
//   roleschannel.fetchMessage('466648570116702208').then(message => {
//       leagueTagMessage = message;
//       leagueTags.forEach(league => {
//           try {
//               message.react(emojis.find("name", league).id);
//           } catch (e) { Maintainer.send(e.toString()); }
//       });
//       message.awaitReactions((r, u) => {
//           let reaction = r._emoji.name;
//           let user = server.members.find("id", u.id);
//           if(user.roles.find("name", "Non-Born Gosu") !== null) {
//               r.remove(user);
//               return;
//           }
//           reaction = reaction[0].toUpperCase() + reaction.substr(1).toLowerCase();
//           if (leagueTags.includes(reaction)){
//               try {
//                   if(user.roles.find("name", reaction) !== null){
//                       user.removeRole(roles.find("name", reaction).id);
//                       r.remove(user);
//                   } else {
//                       user.addRole(roles.find("name", reaction).id);
//                       leagueTags.forEach(league => {
//                           try {
//                               if(reaction !== league){
//                                   user.removeRole(roles.find('name', league).id);
//                               }
//                           } catch (e) { Maintainer.send(e.toString()); }
//                       });
//                       message.reactions.forEach((mreaction, index) => {
//                           if(reaction !== index.split(":")[0]) mreaction.remove(user);
//                       });
//                   }
//               } catch (e) { Maintainer.send(e.toString()); }
//           }
//       });
//   }).catch(console.error);

//   // ❌
//   roleschannel.fetchMessage('466648527544778753').then(message => {
//       try {
//           message.react("❌");
//       } catch (e) { Maintainer.send(e.toString()); }
//       message.awaitReactions((r, u) => {
//           let reaction = r._emoji.name;
//           let user = server.members.find("id", u.id);
//           if(user.roles.find("name", "Non-Born Gosu") !== null) {
//               r.remove(user);
//               return;
//           }
//           if (reaction === "❌"){
//               user.roles.forEach(role => {
//                   if (leagueTags.includes(role.name) || raceTags.includes(role.name) || otherTags.includes((role.name))) {
//                       try{
//                           user.removeRole(role.id);
//                       } catch (e) { Maintainer.send(e.toString()); }
//                   }
//               });
//               raceTagMessage.reactions.forEach(reaction => reaction.remove(user));
//               leagueTagMessage.reactions.forEach(reaction => reaction.remove(user));
//               otherTagMessage.reactions.forEach(reaction => reaction.remove(user));
//           }
//       });
//   }).catch(console.error);

//   // Other - Coop, Osu, Path of Exile ...
//   roleschannel.fetchMessage('487776565942288415').then(message => {
//       otherTagMessage = message;
//       otherTags.forEach(other => {
//           try {
//               message.react(emojis.find("name", other).id);
//           } catch (e) { console.log(e); }
//       });
//       message.awaitReactions((r, u) => {
//           let reaction = r._emoji.name;
//           let user = server.members.find("id", u.id);
//           if (otherTags.includes(reaction)){
//               try {
//                   if(user.roles.find("name", (reaction === "Pathofexile") ? "Path of Exile" : reaction) !== null){
//                       message.reactions.forEach((mreaction, index) => {
//                           if(reaction === index.split(":")[0]) mreaction.remove(user);
//                       });
//                       if (reaction === "Pathofexile") {
//                           reaction = "Path of Exile";
//                       }
//                       user.removeRole(roles.find("name", reaction).id);
//                   } else {
//                       reaction = reaction[0].toUpperCase() + reaction.substr(1).toLowerCase();
//                       if (reaction === "Pathofexile") {
//                           reaction = "Path of Exile";
//                       }
//                       user.addRole(roles.find("name", reaction).id);
//                   }
//               } catch (e) { console.log(e); }
//           }
//       });
//   }).catch(console.error);

//   for(let i = 0; i < 7; i++) {
//       switch (i){
//           case 0:
//               league.push(client.emojis.find("name", "Gold"));
//               break;
//           case 1:
//           case 2:
//               league.push(client.emojis.find("name", "Platinum"));
//               break;
//           case 3:
//           case 4:
//           case 5:
//               league.push(client.emojis.find("name", "Diamond"));
//               break;
//           case 6:
//               league.push(client.emojis.find("name", "Master"));
//               break;
//       }
//   }
// });
