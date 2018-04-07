const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = "_";
let races = [], teamLineup = [], league = [], ctlProfiles = [];
const sc2unmaskedLink = "http://sc2unmasked.com/Search?q=";

client.on("ready", () => {
    // client.user.setUsername("BG Nanny");
    client.user.setActivity("CTL Simulator", { type: "PLAYING"});
    for(var i = 0; i < 7; i++) {
        switch (i){
            case 0:
                league.push(client.emojis.find("name", "Gold"));
                break;
            case 1:
            case 2:
                league.push(client.emojis.find("name", "Plat"));
                break;
            case 3:
            case 4:
            case 5:
                league.push(client.emojis.find("name", "Dia"));
                break;
            case 6:
                league.push(client.emojis.find("name", "Master"));
                break;
        }
    }
});

client.on("message", (message) => {
    if(message.author.username !== client.user.username) {
        var msg = message.content.substr(1, message.content.length);
        var channel = client.guilds.find("name","Pantsu").channels.find("name", "ctl");
        var outputStr;
        if (message.content[0] === process.env.PREFIX) {
            if(adminCheck(message.author.lastMessage.member.roles.find('name', 'Admins'))){
                if (msg.substr(0, 4) === "ping") {
                    message.reply("pang");
                }
                else if (msg.substr(0, 6) === "submit") {
                    ctlLineup(msg);
                    message.channel.send("Done.");
                }
                else if(msg.substr(0, 5) === "races"){
                    lineupRaces(msg);
                    message.channel.send("Done.");
                }
                else if(msg.substr(0, 8) === "profiles"){
                    ctlProfile(msg);
                    message.channel.send("Done.");
                }
                else if (msg.substr(0, 7) === "lineups") {
                    var side = msg.substr(8, msg.length);
                    var teamRaces = [], enemyRaces = [];
                    if(side !== "left" && side !== "right"){
                        message.channel.send("Please correctly specify the side BornGosu is on! (left/right)");
                        return;
                    }
                    if(side === "left") side = true; else side = false;
                    if(teamLineup.length == 0){
                        message.channel.send("Please submit lineups first!");
                        return;
                    }
                    if(races.length == 0){
                        message.channel.send("Please submit races first!");
                        return;
                    }
                    if(ctlProfiles.length == 0){
                        message.channel.send("Please submit CTL profile links first!");
                        return;
                    }
                    races.forEach(function (element, index) {
                        if(index % 2 == 0) teamRaces.push(element);
                        else enemyRaces.push(element);
                    });
                    message.channel.send("Done.");
                    outputStr = "__**CTL Lineups:**__\n";
                    teamLineup.forEach(function(element, index){
                        var coreStr = element.substr(0, element.indexOf("["));
                        var enemyIGN = side ?
                            coreStr.substr(0, coreStr.indexOf("|")) :
                            coreStr.substr(coreStr.indexOf("vs. ")+4, coreStr.substr(coreStr.indexOf("vs. "), coreStr.length).indexOf("|")-4);
                        outputStr += league[index] + " "+ teamRaces[index] + " " + coreStr +
                            enemyRaces[index] + element.substr(element.indexOf("["), element.length) +
                            "\nLink(s):\n"+sc2unmaskedLink+enemyIGN+"\n"+ctlProfiles[index]+"\n\n";
                    });
                    outputStr += "**GLHF everyone!** "+client.guilds.find("name","Pantsu").roles.find("name", "CTL Players");
                    channel.send(outputStr)
                        .then(() => channel.fetchMessages({limit:1})
                            .then(messages => {
                                messages = messages.array();
                                messages[0].pin();
                            }));
                }
            } else {
                // Not admin
            }
        }
    }
});

function ctlLineup(lineup){
    teamLineup = [];
    lineup = lineup.substr(7, lineup.length);
    var lineupArr = lineup.split("\n");
    lineupArr.forEach(function(lineupStr){
        teamLineup.push(lineupStr);
    });
}

function ctlProfile(profiles){
    ctlProfiles = [];
    profiles = profiles.substr(8, profiles.length);
    var profilesArray = profiles.split("\n");
    profilesArray.forEach(function(prof){
        ctlProfiles.push(prof);
    });
}

function lineupRaces(message){
    races = [];
    message = message.substr(6, message.length);
    for(var i=0; i < message.length; i++){
        switch (message[i].toLowerCase()){
            case "t": races.push(client.emojis.find("name", "Terran")+"");
                break;
            case "z": races.push(client.emojis.find("name", "Zerg")+"");
                break;
            case "p": races.push(client.emojis.find("name", "Protoss")+"");
                break;
            case "r": races.push(client.emojis.find("name", "Random")+"");
                break;
            case "n": races.push("");
                break;
            default:
                break;
        }
    }
}

function adminCheck(param) {
    if(param) return true;
    else return false;
}
client.login(process.env.BOT_TOKEN);