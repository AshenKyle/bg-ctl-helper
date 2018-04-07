const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = "_";
let races = [], teamLineup = [];

client.on("ready", () => {
    console.log("I am ready!");
});

client.on("message", (message) => {
    if(message.author.username !== client.user.username) {
        var msg = message.content.substr(1, message.content.length);
        var channel = message.channel;
        if (message.content[0] === process.env.PREFIX) {
            if(adminCheck(message.author.lastMessage.member.roles.find('name', 'Admins'))){
                if (msg.substr(0, 4) === "ping") {
                    message.reply("pang");
                }
                else if (msg.substr(0, 6) === "submit") {
                    ctlLineup(msg);
                    channel.send("Done.");
                }
                else if(msg.substr(0, 5) === "races"){
                    lineupRaces(msg);
                    channel.send("Done.");
                }
                else if (msg.substr(0, 7) === "lineups") {
                    var teamRaces = [], enemyRaces = [];
                    races.forEach(function (element, index) {
                        if(index % 2 == 0) teamRaces.push(element);
                        else enemyRaces.push(element);
                    });
                    teamLineup.forEach(function(element, index){
                        var outputStr = teamRaces[index] + " " + element.substr(0, element.indexOf("[")) + enemyRaces[index] +
                            element.substr(element.indexOf("["), element.length);
                        channel.send(outputStr);
                    });
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
