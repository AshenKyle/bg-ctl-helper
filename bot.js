const Discord = require("discord.js");
const client = new Discord.Client();
const online = true;
const prefix = online ?  process.env.PREFIX : "_";
const guildName = online ? "Born Gosu Gaming" : "Pantsu";
let races = [], teamLineup = [], league = [], ctlProfiles = [], enemyIGN = [], teamIGN = [], score = [], topic;
const sc2unmaskedLink = "http://sc2unmasked.com/Search?q=";
let channel = "";

client.on("ready", () => {
    client.user.setUsername("Ashley");
    channel = client.guilds.find("name", guildName).channels.find("name", "ctl");
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
        var outputStr;
        if (message.content[0] === prefix) {
            if(msg.substr(0, 4) === "help"){
                manualPage(message.author.username);
                return;
            }
            else if (msg.substr(0, 4) === "ping") {
                message.reply("pang");
            }
            else if (msg.substr(0, 10) === "ashencoins") {
                message.channel.send("Received 1 _AsheN Coin_");
            }
            if(adminCheck(message.author.lastMessage.member.roles.find('name', 'Admins'))){
                var command = msg.split(" ");
                if(command[0] === "tryout"){
                    if(command[1] !== null || command[2] !== null || command[3] !== null){
                        tryout(message.channel, message.mentions.users, command[1], command[2], command[3]);
                    }
                }
                else if(command[0] === "promote"){
                    if(command[1] !== null){
                        promote(message.channel, message.mentions.users, command[1]);
                    }
                }
                else if (msg.substr(0, 6) === "submit") {
                    ctlLineup(msg.substr(7, msg.length));
                    //done(message.channel);
                    channel.send("Done.");
                }
                else if(msg.substr(0, 5) === "races"){
                    lineupRaces(msg.substr(6, msg.length));
                    //done(message.channel);
                    channel.send("Done.");
                }
                else if(msg.substr(0, 8) === "profiles"){
                    ctlProfile(msg.substr(8, msg.length));
                    //done(message.channel);
                    channel.send("Done.");
                }
                else if(msg.substr(0, 6) === "update"){
                    if(msg.substr(7, 5) === "score"){

                    } else {
                        ctlTopic(teamIGN, "", msg.substr(7, 1), msg.substr(9, msg.length));
                    }
                    //done(message.channel);
                    channel.send("Done.");
                }
                else if (msg.substr(0, 7) === "lineups") {
                    var week = msg.substr(8, 1);
                    var side = msg.substr(10, 7);
                    var teamRaces = [], enemyRaces = [];
                    if(side !== "left" && side !== "right"){
                        message.channel.send("Please correctly specify the side BornGosu is on! (left/right)");
                        return;
                    }
                    if(side === "right") side = true; else side = false;
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
                    //done(message.channel);
                    channel.send("Done.");
                    outputStr = "__**CTL Lineups FINALS :**__\n";
                    teamLineup.forEach(function(element, index){
                        var coreStr = element.substr(0, element.indexOf("["));
                        var left = coreStr.substr(0, coreStr.indexOf("|"));
                        var right = coreStr.substr(coreStr.indexOf("vs. ")+4, coreStr.substr(coreStr.indexOf("vs. "), coreStr.length).indexOf("|")-4);
                        if (side) {
                            enemyIGN[index] = left;
                            teamIGN[index] = right;
                        } else {
                            enemyIGN[index] = right;
                            teamIGN[index] = left;
                        }
                        outputStr += league[index] + " "+ teamRaces[index] + " " + coreStr +
                            enemyRaces[index] + element.substr(element.indexOf("["), element.length) +
                            "\nLink(s):\n" + sc2unmaskedLink + enemyIGN[index] + "\n" + ctlProfiles[index] + "\n\n";
                    });
                    ctlTopic(teamIGN, week);
                    outputStr += "**GLHF everyone!** "+client.guilds.find("name", guildName).roles.find("name", "CTL Players");
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
        } else if(message.isMentioned(client.user)){
            message.reply("WAT");
        }
    }
});

function ctlLineup(lineup){
    teamLineup = [];
    var lineupArr = lineup.split("\n");
    lineupArr.forEach(function(lineupStr){
        teamLineup.push(lineupStr);
    });
}

function ctlProfile(profiles){
    ctlProfiles = [];
    var profilesArray = profiles.split("\n");
    profilesArray.forEach(function(prof){
        ctlProfiles.push(prof);
    });
}

function lineupRaces(message){
    races = [];
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

function ctlTopic(team, week = "", set = "", str = ""){
    if(week !== "") {
        score[0] = 0;
        score[1] = 0;
        //topic = "CTL Week " + week + " - Score: "+ score[0] + "-" + score[1] +"\n";
        topic = "CTL FINALS - Score: "+ score[0] + "-" + score[1] +"\n";
    }
    else {
        if(str.toLowerCase() === "w"){ score[0]++; }
        else if(str.toLowerCase() === "l") { score[1]++; }
        topic = channel.topic.substr(0, 10) + " - Score: " + score[0] + "-" + score[1] + "\n";
    }
    team.forEach(function(element, index){
        if ((index + 1).toString() === set){
            if(str.toLowerCase() === "w"){ str = "Won"; }
            else if(str.toLowerCase() === "l") { str = "Lost"; }
            topic += "Set " + (index+1) + " - " + element + "- " + str + "\n";
        } else if(week !== "") {
            topic += "Set " + (index+1) + " - " + element + "- Time\n";
        } else {
            topic += channel.topic.split("\n")[index+1] + "\n";
        }
    });
    channel.setTopic(topic).then().catch(console.error);
}

function tryout(channel, user, mentionUser, league, race) {
    if (league.toLowerCase() === "gm"){
        league = "Grand Master";
    }

    var tryoutInfo = "After filling out our recruitment application you have now been given the Tryout Role which represents a trial period in the team. You will continue to have this role for about 1-3 weeks ( depending on your activity ), In that time you can make yourself a part of the community while we review your application! \n" +
        "\n" +
        "We adopt the system of trial membership before official membership to filter out trolls / inactive members out of the team, you can expect a fast promotion if you're active in our discord community and participate in clan-wars,pratice games, team leagues etc. If you have any questions regarding the team in general or your membership feel free to let us know ^^ \n"+
        "\n" + "_(P.S. I'm a bot.)_";

    var leagueString = league[0].toUpperCase() + league.substr(1, league.length);
    var raceString = race[0].toUpperCase() + race.substr(1, race.length);
    user = user.array();
    var tryoutMember = client.users.find("id", user[0].id);

    client.guilds.find("name", guildName).channels.find("name", "teamleaguechat").send("Welcome our newest Tryout to Born Gosu! " + mentionUser + " @here");
    var roles = client.guilds.find("name", guildName).roles;

    tryoutMember.send(tryoutInfo);

    var guildMember = client.guilds.find("name", guildName).member(tryoutMember);
    guildMember.addRole(roles.find("name", "Tryout Member").id);
    guildMember.addRole(roles.find("name", leagueString).id);
    guildMember.addRole(roles.find("name", raceString).id);
    guildMember.removeRole(roles.find("name", "Non-Born Gosu").id);
}

function promote(channel, user, mentionUser){
    user = user.array();
    var tryoutMember = client.users.find("id", user[0].id);

    client.guilds.find("name", guildName).channels.find("name", "teamleaguechat").send("Welcome our newest Born Gosu member! " + mentionUser + " @here");
    var roles = client.guilds.find("name", guildName).roles;

    var guildMember = client.guilds.find("name", guildName).member(tryoutMember);
    guildMember.addRole(roles.find("name", "Born Gosu").id);
    guildMember.removeRole(roles.find("name", "Tryout Member").id);
}

function adminCheck(param) {
    if(param) return true;
    else return false;
}

function done(channel){
    channel.send("Done.")
        .then(() => channel.fetchMessages({limit:1})
            .then(messages => {
                setTimeout(function(){
                    messages = messages.array();
                    messages[0].delete();
                }, 2000);
            }));
}

function manualPage(username) {
    const embed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        /*
         * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
         */
        .setColor(0x00AE86)
        .setDescription("How to use:\n 1) submit \n 2) races\n 3) profiles\n 4) lineups")
        /*
         * Takes a Date object, defaults to current date.
         */
        .addBlankField(true)
        .addField("submit",
            "Syntax: "+prefix+"submit _copy paste lineups from ctl page here_ \n" +
            "Example: +submit SweatyHeart | SweatyHeart#1380 vs. Hillnor | Hillnor#2890 [Acid Plant LE]\n" +
            "Migwel | Migwel#2942 vs. Desperoth | Desperoth#2896 [Abiogenesis LE]\n" +
            "Warbuffll | Warbuffll#1927 vs. Heisswasser | Gorylov17#2529 [Blackpink LE]\n" +
            "Daunted | Daunted#21815 vs. FuriouStyleS | furioustyles#11144 [Neon Violet Square LE]\n" +
            "Voltacus | Voltacus#2297 vs. mondiolita | winsorchein#1762 [Backwater LE]\n" +
            "SnapXD | SnapXD#1369 vs. Shask | Shask#1336 [Catalyst LE]\n" +
            "Sigil | Sigil#1437 vs. SauCeKinG | sauce#1323 [Eastwatch LE]")
        /*
         * Inline fields may not display as inline if the thumbnail and/or image is too big.
         */
        .addBlankField(true)
        .addBlankField(true)
        .addField("races", "Syntax: "+prefix+"races _enter races of the players in order of the sets and from left to right here_\n" +
            "Example: +races pprzpttztpzzzt")
        /*
         * Blank field, useful to create some space.
         */
        .addBlankField(true)
        .addBlankField(true)
        .addField("profiles", "Syntax: "+prefix+"profiles _copy paste each of the enemy players ctl profiles here_\n" +
            "Example: +profiles http://www.choboteamleague.com/profile/16638891\n" +
            "http://www.choboteamleague.com/profile/19219318\n" +
            "http://www.choboteamleague.com/profile/10735948\n" +
            "http://www.choboteamleague.com/profile/18349131\n" +
            "http://www.choboteamleague.com/profile/18717836\n" +
            "http://www.choboteamleague.com/profile/2107144\n" +
            "http://www.choboteamleague.com/profile/3163662")
        .addBlankField(true)
        .addBlankField(true)
        .addField("lineups", "Syntax: "+prefix+"lineups _week-number_ 'left/right'\n" +
            "Example: +lineups 8 left\n" +
            "Example: +lineups 1 right")
        .addBlankField(true)
        .addBlankField(true)
        .addField("Other Commands", prefix+"update _set-number_ _w/l/status_\n" +
            prefix+"tryout @user _league_ _race_\n" +
            prefix+"promote @user\n" +
            "If you need more detailed information please message AsheN!")
        .addBlankField(true)
        .addBlankField(true)
        .addField("Miscellaneous", prefix+"help\n" +
            prefix+"ping\n"+
            prefix+"ashencoins\n");
    // Intro
    /*
    client.users.find("username", username).send({
        embed: {
            color: "#efa5aa",
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL
            },
            title: "Commands",
            description: "How to use:\n 1) submit \n  2) races\n 3) profiles\n 4) lineups",
            fields: [{
                    name: "submit",
                    value: "Syntax: <prefix>submit _copy paste lineups from ctl page here_ \n" +
                    "Example: +submit SweatyHeart | SweatyHeart#1380 vs. Hillnor | Hillnor#2890 [Acid Plant LE]\n" +
                    "Migwel | Migwel#2942 vs. Desperoth | Desperoth#2896 [Abiogenesis LE]\n" +
                    "Warbuffll | Warbuffll#1927 vs. Heisswasser | Gorylov17#2529 [Blackpink LE]\n" +
                    "Daunted | Daunted#21815 vs. FuriouStyleS | furioustyles#11144 [Neon Violet Square LE]\n" +
                    "Voltacus | Voltacus#2297 vs. mondiolita | winsorchein#1762 [Backwater LE]\n" +
                    "SnapXD | SnapXD#1369 vs. Shask | Shask#1336 [Catalyst LE]\n" +
                    "Sigil | Sigil#1437 vs. SauCeKinG | sauce#1323 [Eastwatch LE]"
                },
                {
                    name: "races",
                    value: "Syntax: <prefix>races _enter races of the players in order of the sets and from left to right here_\n" +
                    "Example: +races pprzpttztpzzzt"
                },
                {
                    name: "profiles",
                    value: "Syntax: <prefix>profiles _copy paste each of the enemy players ctl profiles here_\n" +
                    "Example: +profiles http://www.choboteamleague.com/profile/16638891\n" +
                    "http://www.choboteamleague.com/profile/19219318\n" +
                    "http://www.choboteamleague.com/profile/10735948\n" +
                    "http://www.choboteamleague.com/profile/18349131\n" +
                    "http://www.choboteamleague.com/profile/18717836\n" +
                    "http://www.choboteamleague.com/profile/2107144\n" +
                    "http://www.choboteamleague.com/profile/3163662"
                },
                {
                    name: "lineups",
                    value: "Syntax: <prefix>lineups _week-number_ 'left/right'" +
                    "Example: +lineups 8 left" +
                    "Example: +lineups 1 Sunday 1PM EDT"
                },
                {
                    name: "Other Commands:",
                    value: "<prefix>update _set-number_ _w/l/status_\n" +
                    "If you need more detailed information please message AsheN!"
                }
            ]
        }
    });
    */
    // How to use
    client.users.find("username", username).send(embed);
    // client.users.find("username", username).send("In Progress >.> sorry please ask AsheN for more Information!");
}
client.login(process.env.BOT_TOKEN);