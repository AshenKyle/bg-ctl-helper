const withAdmin = require('./messageHandlers/withAdminPermission')
const unlessAdmin = require('./messageHandlers/unlessAdminPermission')
const withRoles = require('./messageHandlers/withRolesPermission')
const unlessRoles = require('./messageHandlers/unlessRolesPermission')

const commandRouter = {
  surgeryStatus: require('./messageHandlers/surgeryStatus'),
}

const roomRouter = {
  "s-e-l-l-o-u-t": unlessAdmin({ handler: require('./roomHandlers/sellout') }),
}

module.exports = async ({ discordInterface, prefix, onError }) => discordMsg => {
  try {
    if (discordMsg.author.username !== discordInterface.client.user.username) {
      if (roomRouter[discordMsg.channel.name]) {
        roomRouter[discordMsg.channel.name]({ discordMsg, discordInterface })
      } else if (discordMsg.content[0] === prefix) {
        const commandParts = discordMsg.content.substring(1).split(" ")

        if (commandRouter[commandParts[0]]) {
          return commandRouter[commandParts[0]]({ discordMsg, discordInterface })
        }
        discordMsg.reply(`Ashley Prime could not process that command. If this is unexpected, please contact ${discordInterface.maintainer.username}`)
      }
    }
  } catch (e) {
    const rawMsg = discordMsg ? discordMsg.content : '<missing discord message>'
    onError(`Error during routing of message '${rawMsg}': ${e.toString()}`)
  }





  // let outputStr;
  // if (lastUser === message.author && message.channel === ctlLastMessageChannel && message.content[0] !== prefix) {
  //   if (message.cleanContent === "quit") {
  //     lastUser = undefined;
  //     if (ctlLastMessageID !== undefined) {
  //       ctlLastMessageChannel.fetchMessage(ctlLastMessageID).then(msg => msg.delete());
  //     }
  //   } else {
  //     ctlCommand(message.channel, message.cleanContent);
  //   }
  // } else if (message.content[0] === prefix) {
  //   if (lastUser === message.author && command[0] !== "help") lastUser = undefined;
  //   try {
  //     if (command[0] === "search") {
  //       let msgID = "";
  //       message.channel.send("Processing request...")
  //         .then(msg => msgID = msg.id);
  //       let msg = [], index = 0;
  //       sc2unmaskedJs.search(command[1], (result) => {
  //         console.log(result.length);
  //         if (result.length > 0) {
  //           msg[index] = "";
  //           result.forEach(result => {
  //             let league = result.league[0].toUpperCase() + result.league.substr(1, result.league.length);
  //             let race = result.race[0].toUpperCase() + result.race.substr(1, result.race.length);
  //             try {
  //               msg[index] +=
  //                 "\:flag_" + result.region.toLowerCase() + ": " +
  //                 "**" + result.ign + "** " +
  //                 client.emojis.find("name", league.split(" ")[0]) + league + " (" + result.mmr + " MMR) " +
  //                 client.emojis.find("name", race) + race + ", " +
  //                 ((result.winRatioGames !== undefined) ? result.winRatioGames : "N/A") + " (" + result.winRatioPercentage + " Win rate) " + "\n" +
  //                 result.sc2Link + "\n\n"
  //                 ;
  //               if (msg[index].length + 230 > 2000) {
  //                 msg[++index] = "";
  //               }
  //             } catch (e) {
  //               console.log(e);
  //             }
  //           });
  //         } else {
  //           msg[0] = "No player found with the name: '" + command[1] + "'";
  //         }
  //         try {
  //           message.channel.fetchMessage(msgID).then(msg => msg.delete());
  //           msg.forEach(singleMsg => message.channel.send(singleMsg));
  //         } catch (e) {
  //           console.log(e);
  //         }
  //       });
  //     }
  //     else if (message.author.lastMessage.member.roles.find('name', 'Mentors')) {
  //       if (command[0] === "tstatus") {
  //         tryoutStatus(message.author);
  //       }
  //     }
  //     else if (adminCheck(message)) {
  //       if (command[0] === "tryout") {
  //         if (message.mentions.users.firstKey() !== undefined) {
  //           try {
  //             tryout(message.mentions.users, message.channel);
  //           } catch (e) {
  //             message.channel.send("An error has occurred.");
  //             Maintainer.send(e.toString());
  //           }
  //         } else {
  //           message.channel.send("Please specify which user(s) to promote.");
  //         }
  //       }
  //       else if (command[0] === "tremove") {
  //         let tryouts = message.mentions.users.array();
  //         let success = [], error = [];
  //         tryouts.forEach((tryout, index) => {
  //           try {
  //             saveHandler.connect(server.members.find('id', tryout.id), saveHandler.tryouts.remove);
  //             success.push(tryout.username);
  //           } catch (e) {
  //             error.push(tryout.username);
  //             Maintainer.send("Error with Tryout: " + tryout.username + " (" + tryout.id + ")");
  //             Maintainer.send(e.toString());
  //           }
  //         });
  //         message.channel.send("Successfully added: " + success + "\nError with: " + error);
  //       }
  //       else if (command[0] === "tstatus") {
  //         tryoutStatus(message.author);
  //       }
  //       else if (command[0] === "treset") {
  //         if (message.author === Maintainer) {
  //           saveHandler.connect(message.channel, saveHandler.tryouts.reset);
  //         } else {
  //           message.channel.send("This command can only be used be used by " + CurrentMaintainer + ".");
  //         }
  //       }
  //       else if (command[0] === "promote") {
  //         if (message.mentions.users.array().length > 0) {
  //           promote(message.mentions.users, message.channel);
  //         }
  //       }
  //       else if (command[0] === "demote") {
  //         if (message.mentions.users.array().length > 0) {
  //           demote(message.mentions.users, message.channel);
  //         } else {
  //           message.channel.send("No tryout(s) specified for demotion.");
  //         }
  //       }
  //       else if (command[0] === "ctl") {
  //         lastUser = message.author;
  //         if (ctlLastMessageID !== undefined) ctlLastMessageChannel.fetchMessage(ctlLastMessageID).then(msg => msg.delete());
  //         ctlCommand(message.channel);
  //       }
  //       else if (msg.substr(0, 6) === "submit") {
  //         ctlLineup(msg.substr(7, msg.length));
  //         channel.send("Done.").then(msg => setTimeout(() => { msg.delete() }, 5000));
  //       }
  //       else if (msg.substr(0, 5) === "races") {
  //         lineupRaces(msg.substr(6, msg.length));
  //         channel.send("Done.").then(msg => setTimeout(() => { msg.delete() }, 5000));
  //       }
  //       else if (msg.substr(0, 8) === "profiles") {
  //         ctlProfile(msg.substr(8, msg.length));
  //         channel.send("Done.").then(then(msg => setTimeout(() => { msg.delete() }, 5000)));
  //       }
  //       else if (command[0] === "lineups") {
  //         let week = command[1];
  //         let side = command[2];
  //         let teamRaces = [], enemyRaces = [];
  //         if (side !== "left" && side !== "right") {
  //           message.channel.send("Please correctly specify the side BornGosu is on! (left/right)");
  //           return;
  //         }
  //         if (side === "right") side = true; else side = false;
  //         if (teamLineup.length == 0) {
  //           message.channel.send("Please submit lineups first!");
  //           return;
  //         }
  //         if (races.length == 0) {
  //           message.channel.send("Please submit races first!");
  //           return;
  //         }
  //         if (ctlProfiles.length == 0) {
  //           message.channel.send("Please submit CTL profile links first!");
  //           return;
  //         }
  //         races.forEach(function (element, index) {
  //           if (index % 2 == 0) teamRaces.push(element);
  //           else enemyRaces.push(element);
  //         });
  //         switch (week) {
  //           case "p1":
  //             outputStr = "__**CTL Lineups Playoffs Week 1:**__\n\n";
  //             break;
  //           case "p2":
  //             outputStr = "__**CTL Lineups Playoffs Week 2:**__\n\n";
  //             break;
  //           case "p3":
  //             outputStr = "__**CTL Lineups Playoffs Week 3:**__\n\n";
  //             break;
  //           default:
  //             outputStr = "__**CTL Lineups Week " + week + ":**__\n\n";
  //             break;
  //         }
  //         teamLineup.forEach(function (element, index) {
  //           let coreStr = element.substr(0, element.indexOf("["));
  //           let left = coreStr.substr(0, coreStr.indexOf("|"));
  //           let right = coreStr.substr(coreStr.indexOf("vs. ") + 4, coreStr.substr(coreStr.indexOf("vs. "), coreStr.length).indexOf("|") - 4);
  //           if (side) {
  //             enemyIGN[index] = left;
  //             teamIGN[index] = right;
  //           } else {
  //             enemyIGN[index] = right;
  //             teamIGN[index] = left;
  //           }
  //           outputStr += league[index] + " " + teamRaces[index] + " " + coreStr +
  //             enemyRaces[index] + element.substr(element.indexOf("["), element.length) +
  //             "\nLink(s):\n" + sc2unmaskedLink + enemyIGN[index].trim() + "\n" + ctlProfiles[index] + "\n\n";
  //         });
  //         ctlTopic(teamIGN, week);
  //         outputStr += "**GLHF everyone!** " + server.roles.find("name", "CTL Players");
  //         channel.send(outputStr)
  //           .then(msg => {
  //             msg.pin();
  //           });
  //         channel.send(ctlStepsMessage).then(msg => {
  //           msg.pin();
  //         });
  //       }
  //       // Not admin
  //     } else if (["submit", "races", "profiles", "lineups", "promote", "tryout", "tupdate", "tstatus", "ctl", "demote"].includes(command[0])) {
  //       message.channel.send("Shoo, you don't have the permissions!").then(msg => setTimeout(() => { msg.delete() }, 5000));
  //     }
  //   } catch (e) {
  //     message.channel.send("error with: " + command[0]);
  //     Maintainer.send(e.toString());
  //   }
  // }
}
