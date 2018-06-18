const Discord = require("discord.js");
const client = new Discord.Client();
const online = true;
const prefix = online ?  process.env.PREFIX : "_";
const guildName = online ? "Born Gosu Gaming" : "Pantsu";
let races = [], teamLineup = [], league = [], ctlProfiles = [], enemyIGN = [], teamIGN = [], score = [], topic;
const sc2unmaskedLink = "http://sc2unmasked.com/Search?q=";
let channel = "";
let spamcount = 0;
const ctlStepsMessage = "Hey guys, Welcome to the CTL Week, thank you for participating in this and I wish you all luck and enjoy!\n" +
    "This is a closed off chat channel for people, who are playing for CTL, and is mainly used for keeping track of the match statuses.\n" +
    "Generally there are several steps that CTL players have to do in order for this to be smooth and cleanly done without much difficulties.\n" +
    "\n" +
    "First, **scheduling the match**. You guys have to PM your opponents **on the CTL Site through the link provided above** and set up a **fixed time and day** for your match including the **timezone** as well! Also please let us know about the status of your match, whether you've contacted your opponent, trying to set up a time or already got the match scheduled. It just helps us keep track of things.\n" +
    "\n" +
    "Second, **scouting your opponent**. If you look at where I tagged you guys, you'll notice some websites there containing replays of your opponents.\n" +
    "We usually just take a quick look at what style our opponent generally favors, whether they're a macro player, all-inner/cheeser or just a weird guy in general and try to come up with builds/openers/strategies to help prepare for your opponents' tendencies. But also so that you guys aren't caught off-guard.\n" +
    "\n" +
    "Third, **practice**! Ask around people what they would think is strong vs certain stuff, and try to put that into practice with others! Only by really experiencing and \"testing the waters\" will you prepare yourself for your match quite well.\n" +
    "Tip: While doing customs, make sure they're set to \"No Match History\" so your builds can't get scouted\n" +
    "\n" +
    "Fourth, **playing the game**. The real deal, not matter the outcome though, just enjoy it, especially if you lose. It's a Team League which is for fun, but that doesn't mean you should lose on purpose.\n" +
    "\n" +
    "Fifth, **reporting the outcome of the game**. After the game, you will then have to let us know of the result and in case of a win, we would need the replay too to get credibility for that win.";

client.on("ready", () => {
    client.users.find("username", "AsheN").send("READY FOR ACTON");
    client.user.setUsername("Ashley");
    channel = client.guilds.find("name", guildName).channels.find("name", "ctl");
    client.user.setActivity("CTL Simulator", { type: "PLAYING"});
    for(let i = 0; i < 7; i++) {
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
        let msg = message.content.substr(1, message.content.length);
        let command = msg.split(" ");
        let outputStr;
        if (message.content[0] === prefix) {
            try {
                if (msg.substr(0, 4) === "help") {
                    manualPage(message.author.username);
                    return;
                }
                else if (msg.substr(0, 4) === "ping") {
                    message.reply("pang");
                }
                else if (msg.substr(0, 10) === "ashencoins") {
                    message.channel.send("**+1 AsheN-Coin**");
                }
                else if (command[0] === "ashenpoints") {
                    message.channel.send("https://docs.google.com/spreadsheets/d/19aGexTYvWLkLQuAmzwp1u4qTZSwakfBbP_rTTQPkbKg/edit#gid=0");
                }
                else if (command[0] === "events" || command[0] === "calendar") {
                    let calendarURL = "https://calendar.google.com/calendar/embed?src=teamborngosu%40gmail.com";
                    if (command[1]) {
                        switch (command[1].toLowerCase()) {
                            case "cet":
                            case "cest":
                                calendarURL += "&ctz=Europe%2FBerlin";
                                break;
                            case "est":
                            case "edt":
                                calendarURL += "&ctz=America%2FNew_York";
                                break;
                            case "mst":
                            case "mdt":
                                calendarURL += "&ctz=America%2FPhoenix";
                                break;
                            case "nzt":
                                calendarURL += "&ctz=Pacific%2FAuckland";
                                break;
                        }
                    }
                    message.channel.send(calendarURL);
                }
                else if (adminCheck(message.author.lastMessage.member.roles.find('name', 'Admins'))) {
                    if (command[0] === "tryout") {
                        if (command[1] !== null || command[2] !== null || command[3] !== null) {
                            try {
                                tryout(message.mentions.users, command[1], command[2], command[3], message.channel);
                            } catch (e) {
                                client.users.find("username", "AsheN").send("An error has occurred.");
                                console.log(e);
                            }
                        }
                    }
                    else if (command[0] === "promote") {
                        if (command[1] !== null) {
                            promote(message.mentions.users, command);
                        }
                    }
                    else if (msg.substr(0, 6) === "submit") {
                        ctlLineup(msg.substr(7, msg.length));
                        //done(message.channel);
                        channel.send("Done.");
                    }
                    else if (msg.substr(0, 5) === "races") {
                        lineupRaces(msg.substr(6, msg.length));
                        //done(message.channel);
                        channel.send("Done.");
                    }
                    else if (msg.substr(0, 8) === "profiles") {
                        ctlProfile(msg.substr(8, msg.length));
                        //done(message.channel);
                        channel.send("Done.");
                    }
                    else if (msg.substr(0, 6) === "update") {
                        if (msg.substr(7, 5) === "score") {

                        } else {
                            ctlTopic(teamIGN, "", msg.substr(7, 1), msg.substr(9, msg.length));
                        }
                        //done(message.channel);
                        channel.send("Done.");
                    }
                    else if (msg.substr(0, 7) === "lineups") {
                        let week = msg.substr(8, 1);
                        let side = msg.substr(10, 7);
                        let teamRaces = [], enemyRaces = [];
                        if (side !== "left" && side !== "right") {
                            message.channel.send("Please correctly specify the side BornGosu is on! (left/right)");
                            return;
                        }
                        if (side === "right") side = true; else side = false;
                        if (teamLineup.length == 0) {
                            message.channel.send("Please submit lineups first!");
                            return;
                        }
                        if (races.length == 0) {
                            message.channel.send("Please submit races first!");
                            return;
                        }
                        if (ctlProfiles.length == 0) {
                            message.channel.send("Please submit CTL profile links first!");
                            return;
                        }
                        races.forEach(function (element, index) {
                            if (index % 2 == 0) teamRaces.push(element);
                            else enemyRaces.push(element);
                        });
                        //done(message.channel);
                        channel.send("Done.");
                        outputStr = "__**CTL Lineups Week " + week + " :**__\n";
                        teamLineup.forEach(function (element, index) {
                            let coreStr = element.substr(0, element.indexOf("["));
                            let left = coreStr.substr(0, coreStr.indexOf("|"));
                            let right = coreStr.substr(coreStr.indexOf("vs. ") + 4, coreStr.substr(coreStr.indexOf("vs. "), coreStr.length).indexOf("|") - 4);
                            if (side) {
                                enemyIGN[index] = left;
                                teamIGN[index] = right;
                            } else {
                                enemyIGN[index] = right;
                                teamIGN[index] = left;
                            }
                            outputStr += league[index] + " " + teamRaces[index] + " " + coreStr +
                                enemyRaces[index] + element.substr(element.indexOf("["), element.length) +
                                "\nLink(s):\n" + sc2unmaskedLink + enemyIGN[index] + "\n" + ctlProfiles[index] + "\n\n";
                        });
                        ctlTopic(teamIGN, week);
                        outputStr += "**GLHF everyone!** " + client.guilds.find("name", guildName).roles.find("name", "CTL Players");
                        channel.send(outputStr)
                            .then(() => channel.fetchMessages({limit: 1})
                                .then(messages => {
                                    messages = messages.array();
                                    messages[0].pin();
                                }));
                        channel.send(ctlStepsMessage);
                    }
                } else {
                    message.channel.send("Shoo, you don't have the permissions!");
                    // Not admin
                }
            } catch (e) {
                client.users.find("name", "AsheN").send("error with: " + command[0]);
            }
        } else if(message.isMentioned(client.user)){
            let replymsg = "WAT";
            switch (spamcount % 4){
                case 0:
                    replymsg = "WAT";
                    break;
                case 1:
                    replymsg = "stop tagging me.";
                    break;
                case 2:
                    replymsg = "stop it.";
                    break;
                case 3:
                    replymsg = "fak of.";
                    break;
            }
            spamcount++;
            message.reply(replymsg);
        }
    }
});

function ctlLineup(lineup){
    teamLineup = [];
    let lineupArr = lineup.split("\n");
    lineupArr.forEach(function(lineupStr){
        teamLineup.push(lineupStr);
    });
}

function ctlProfile(profiles){
    ctlProfiles = [];
    let profilesArray = profiles.split("\n");
    profilesArray.forEach(function(prof){
        ctlProfiles.push(prof);
    });
}

function lineupRaces(message){
    races = [];
    for(let i=0; i < message.length; i++){
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
        topic = "CTL Week " + week + " - Score: "+ score[0] + "-" + score[1] +"\n";
        //topic = "CTL FINALS - Score: "+ score[0] + "-" + score[1] +"\n";
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

function tryout(user, mentionUser, league, race, channel) {
    if (league.toLowerCase() === "gm" || league.toLowerCase() === "grandmaster"){
        league = "Grand Master";
    } else if (league.toLowerCase() === "unranked"){
        league = "";
    }

    if (race.toLowerCase() === "none") race = "";

    let tryoutInfo = "After filling out our recruitment application you have now been given the Tryout Role which represents a trial period in the team. You will continue to have this role for about 1-3 weeks ( depending on your activity ), In that time you can make yourself a part of the community while we review your application! \n" +
        "\n" +
        "We adopt the system of trial membership before official membership to filter out trolls / inactive members out of the team, you can expect a fast promotion if you're active in our discord community and participate in clan-wars,pratice games, team leagues etc. If you have any questions regarding the team in general or your membership feel free to let us know ^^ \n"+
        "\n" + "_(P.S. I'm a bot.)_";

    let leagueString = (league !== "") ? league[0].toUpperCase() + league.substr(1, league.length) : "";
    let raceString = (race !== "") ? race[0].toUpperCase() + race.substr(1, race.length) : "";
    user = user.array();
    let tryoutMember = client.users.find("id", user[0].id);


    let roles = client.guilds.find("name", guildName).roles;
    try {
        tryoutMember.send(tryoutInfo);
    } catch (e){ }

    let guildMember = client.guilds.find("name", guildName).member(tryoutMember);
    guildMember.addRole(roles.find("name", "Tryout Member").id);
    if(leagueString !== ""){
        if(leagueString === "Master" || leagueString === "Masters"){
            leagueString = "Masters";
            guildMember.addRole(roles.find("name", leagueString).id);
        } else if (leagueString === "Silver" || leagueString === "Gold" || leagueString === "Platinum" || leagueString === "Diamond" || leagueString === "Grand Master") {
            guildMember.addRole(roles.find("name", leagueString).id);
        } else {
            channel.send("Incorrect league parameter, try again m8...");
            return;
        }
    }
    if(raceString !== "" && (raceString === "Zerg" || raceString === "Terran" || raceString === "Protoss" || raceString === "Random")) guildMember.addRole(roles.find("name", raceString).id);
    else {
        channel.send("Incorrect race parameter, try again m8...");
        return;
    }
    try {
        guildMember.removeRole(roles.find("name", "Non-Born Gosu").id);
    } catch (e){ }
    client.guilds.find("name", guildName).channels.find("name", "teamleaguechat").send("Welcome our newest Tryout to Born Gosu! " + mentionUser + " @here");
}

function promote(user, mentionUser){
    user = user.array();
    let tryoutMembers = [];
    let roles = client.guilds.find("name", guildName).roles;

    user.forEach((tryout, index) => {
        tryoutMembers.push(client.users.find("id", tryout.id));
        let guildMember = client.guilds.find("name", guildName).member(tryoutMembers[index]);
        guildMember.addRole(roles.find("name", "Born Gosu").id);
        guildMember.removeRole(roles.find("name", "Tryout Member").id);
    });

    mentionUser = mentionUser.slice(1);
    client.guilds.find("name", guildName).channels.find("name", "teamleaguechat").send("Welcome our newest Born Gosu member(s)! " + mentionUser + " @here");
}

function adminCheck(param) {
    return !!param;
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
            prefix+"promote @user\n" +
            "If you need more detailed information please message AsheN!")
        .addBlankField(true)
        .addBlankField(true)
        .addField("tryout", "Syntax: "+prefix+"tryout _tag user_ _league_ _race_\n" +
            "Example: "+prefix+"tryout @ashen gold zerg\n"+
            "Example: "+prefix+"tryout @ashen unranked none\n")
        .addBlankField(true)
        .addBlankField(true)
        .addField("events/calendar", "Syntax: "+prefix+"events/calendar [cest/cet/edt/est/mst/mdt/nzt]\n" +
            "Example: "+prefix+"events\n"+
            "Example: "+prefix+"events cest\n"+
            "Example: "+prefix+"calendar est\n")
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