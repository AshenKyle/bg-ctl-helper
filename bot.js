const Discord = require("discord.js");
const fs = require("file-system");
const client = new Discord.Client();
const online = true;
const mia = false;
const prefix = online ?  process.env.PREFIX : "_";
let races = [], teamLineup = [], league = [], ctlProfiles = [], enemyIGN = [], teamIGN = [], score = [], topic;
const sc2unmaskedLink = "http://sc2unmasked.com/Search?q=";
let server;
let channel = "";
let spamcount = 0;
let AsheN;
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const dateToString = function(date){
    let dateString = monthNames[new Date(date).getMonth()] + " " + new Date(date).getDate() + ", " + new Date(date).getFullYear();
    return dateString;
};
const date_diff_indays = function(date1, date2) {
    let diff = Date.parse(date1) - Date.parse(date2);
    return Math.floor(diff / (24 * 60 * 60 * 1000));
};
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

// MongoDB
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://' + process.env.DB_USER + ':'+ process.env.DB_PW +'@ds1' + process.env.DB_PORT + '.mlab.com:' + process.env.DB_PORT + '/bg-ctl-helper';
const dbName = "bg-ctl-helper";

const saveHandler = {
    'connect': (params, callback) => {
        MongoClient.connect(url, (err, client) => {
            assert.equal(null, err);

            const db = client.db(dbName);

            if(callback !== undefined) {
                try {
                    callback(db, params, () => {
                        client.close();
                    });
                } catch (e) {
                    AsheN.send(e.toString());
                    client.close();
                }
            }
        });
    },
    'tryouts': {
        'reset': (db, channel) => {
            let tryoutMembers = [];
            db.collection('tryout').removeMany();
            server.roles.get(server.roles.find("name", "Tryout Member").id).members.forEach(member => {
                member = server.members.find("id", member.id);
                tryoutMembers.push({
                    "id": member.id,
                    "tag": member.user.tag,
                    "joindate": member.joinedAt,
                    "tryoutsince": ""
                });
            });
            db.collection('tryout').insertMany(tryoutMembers, (err, result) => {
                if (err) throw err;
                channel.send("RESET DONE").then(msg => {
                    setTimeout(() => {
                        msg.delete();
                    }, 5000)
                });
            });
        },
        'add': (db, params) => {
            let tryoutMember = {
                "id": params.id,
                "tag": params.user.tag,
                "joindate": params.joinedAt,
                "tryoutsince": new Date(Date.now())
            };
            db.collection('tryout').insert(tryoutMember, (err, result) => {
                if (err) throw err;
            });
        },
        'find': (db, params) => {
            let options = params !== '' ? { id: params.array()[0].id } : {};
            db.collection('tryout').find(options).toArray((err, result) => {
                assert.equal(null, err);
            });
        },
        'update': (db, params) => {
            let users = params[0], channel = params[2];
            let userString = [], userNotFound = [], changed = false;
            let options = params[1].splice(users.array().length + 1);
            options.forEach((option, index) => options[index] = option.toLowerCase());
            let forEachCounter = 0;
            users.forEach(user => {
                if(options.indexOf('tryoutsince:') >= 0){
                    db.collection('tryout').findOneAndUpdate(
                        { id: user.id },
                        {$set: { tryoutsince: new Date(options[options.indexOf('tryoutsince:')+1]) } }, [],
                        (err, result) => {
                            assert.equal(null, err);
                            forEachCounter++;
                            changed = result.lastErrorObject.updatedExisting || changed;
                            if(changed) userString.push(user.username);
                            if(!result.lastErrorObject.updatedExisting) userNotFound.push(user.username);
                            if(forEachCounter === users.array().length) {
                                channel.send(
                                    changed ? "Tryout" + ((userString.length > 1) ? "s" : "") + ": " + userString + " updated!" : "" +
                                        (userNotFound.length > 0) ?
                                        "No changes made to Tryout"+((userString.length>1) ? "s" : "") +" __" + userNotFound + "__: Not found." :
                                        ""
                                );
                            }
                        }
                    );
                } else { channel.send("Please specify parameters to update. (e.g: \"tryoutsince: 2018-7-2\")"); }
            });
        },
        "remove": (db, params) => {
            db.collection('tryout').findOneAndDelete({ id: params });
        },
        "status": (db, params) => {
            let tryoutEmbed = [], tryoutFields = [], fecounter = 0;
            tryoutEmbed[0] = new Discord.RichEmbed()
                .setAuthor("Born Gosu Tryout Status", server.iconURL)
                .setColor([220, 20, 60]);
            db.collection('tryout').find({}).toArray((err, result) => {
                assert.equal(null, err);
                let eligibility = [ ":x: Not yet eligible for Promotion/Demotion",
                    ":white_check_mark: **__eligible for Promotion/Demotion__**"
                ];
                let i = 0, j = 1;
                result.forEach((field) => {
                    try {
                        tryoutFields.push({
                            "tag": server.members.find("id", field.id).user.tag,
                            "joined": "__Joined Server:__ " + new Date(field.joindate).toLocaleDateString() + " / " + dateToString(field.joindate) + " (" + date_diff_indays(new Date(Date.now()), field.joindate) + " Days ago)\n",
                            "tryoutSince": "**Tryout since:** " + new Date(field.tryoutsince).toLocaleDateString() + " / " + dateToString(field.tryoutsince) + " (" + date_diff_indays(new Date(Date.now()), new Date(field.tryoutsince)) + " Days)" + "\n",
                            "tryoutFor": date_diff_indays(new Date(Date.now()), new Date(field.tryoutsince)),
                            "eligibility": (date_diff_indays(new Date(Date.now()), new Date(field.tryoutsince)) >= 14) ? eligibility[1] : eligibility[0]
                        });
                    } catch (e) {
                        AsheN.send(field.id);
                        AsheN.send(e.toString());
                    }

                });
                tryoutFields.sort((a,b)=>{
                    return b.tryoutFor - a.tryoutFor;
                });
                tryoutFields.forEach(tryout => {
                    j += 4;
                    if(j + 4 >= 25){
                        j = 1;
                        i++;
                        tryoutEmbed.push(new Discord.RichEmbed().setColor([220, 20, 60]));
                    }
                    tryoutEmbed[i].addField(
                        tryout.tag,
                        tryout.joined
                    ).addField(
                        tryout.tryoutSince,
                        tryout.eligibility
                    ).addBlankField();
                });
                tryoutEmbed.forEach((embed, index) => {
                    embed.setFooter("Page " + (index+1) + "/" + (tryoutEmbed.length));
                    params.send(embed);
                });
            });
        }
    }
};

client.on("ready", () => {
    try {
        AsheN = client.users.find("id", "105301872818028544");
        // 331491114769055747
    } catch (e){
        AsheN.send(e.toString())
    }
    client.user.setUsername("Ashley");
    server = client.guilds.find("name", (online) ? "Born Gosu Gaming" : "Pantsu");
    try {
        server.channels.find("name", "bot-channel").send("I'M AWAKE.");
    } catch (e) { AsheN.send(e.toString()); }
    channel = server.channels.find("name", "ctl");

    // SELF ASSIGNABLE ROLES
    let roles = server.roles;
    let roleschannel = server.channels.find("name", "channels-roles-faq");
    let emojis = server.emojis;
    let raceTags = ["Terran", "Protoss", "Zerg", "Random"];
    let leagueTags = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"];

    // race
    roleschannel.fetchMessage('466648565415018507').then(message => {
        raceTags.forEach(race => {
            try {
                message.react(emojis.find("name", race).id);
            } catch (e) { AsheN.send(e.toString()); }
        });
        message.awaitReactions((r, u) => {
            let reaction = r._emoji.name;
            let user = server.members.find("id", u.id);
            if(user.roles.find("name", "Non-Born Gosu") !== null) return;
            reaction = reaction[0].toUpperCase() + reaction.substr(1).toLowerCase();
            if (raceTags.includes(reaction)){
                try {
                    user.addRole(roles.find("name", reaction).id);
                } catch (e) { AsheN.send(e.toString()); }
            }
        });
    }).catch(console.error);

    // league
    roleschannel.fetchMessage('466648570116702208').then(message => {
        leagueTags.forEach(league => {
            try {
                message.react(emojis.find("name", league).id);
            } catch (e) { AsheN.send(e.toString()); }
        });
        message.awaitReactions((r, u) => {
            let reaction = r._emoji.name;
            let user = server.members.find("id", u.id);
            if(user.roles.find("name", "Non-Born Gosu") !== null) return;
            reaction = reaction[0].toUpperCase() + reaction.substr(1).toLowerCase();
            if (leagueTags.includes(reaction)){
                try {
                    user.addRole(roles.find("name", reaction).id);
                    leagueTags.forEach(league => {
                        try {
                            if(reaction !== league){
                                user.removeRole(roles.find('name', league).id);
                            }
                        } catch (e) { AsheN.send(e.toString()); }
                    });
                } catch (e) { AsheN.send(e.toString()); }
            }
        });
    }).catch(console.error);

    // ❌
    roleschannel.fetchMessage('466648527544778753').then(message => {
        try {
            message.react("❌");
        } catch (e) { AsheN.send(e.toString()); }
        message.awaitReactions((r, u) => {
            let reaction = r._emoji.name;
            let user = server.members.find("id", u.id);
            if(user.roles.find("name", "Non-Born Gosu") !== null) return;
            if (reaction === "❌"){
                user.roles.forEach(role => {
                    if (leagueTags.includes(role.name) || raceTags.includes(role.name)) {
                        try{
                            user.removeRole(role.id);
                        } catch (e) { AsheN.send(e.toString()); }
                    }
                });
            }
        });
    }).catch(console.error);

    client.user.setActivity("CTL Simulator", { type: "PLAYING"});
    for(let i = 0; i < 7; i++) {
        switch (i){
            case 0:
                league.push(client.emojis.find("name", "Gold"));
                break;
            case 1:
            case 2:
                league.push(client.emojis.find("name", "Platinum"));
                break;
            case 3:
            case 4:
            case 5:
                league.push(client.emojis.find("name", "Diamond"));
                break;
            case 6:
                league.push(client.emojis.find("name", "Master"));
                break;
        }
    }
});

client.on("guildMemberRemove", (member) => {
    if(member.roles.find("name", "Tryout Member") !== null){
        saveHandler.connect(member.user.id, saveHandler.tryouts.remove);
    }
});

client.on("message", (message) => {
    if(message.author.username !== client.user.username) {
        let msg = message.content.substr(1, message.content.length);
        let command = [];
        msg.split(" ").forEach((cmd) => {
            if (cmd.length !== 0) {
                command.push(cmd);
            }
        });
        let outputStr;
        if(message.channel.name === "s-e-l-l-o-u-t" && !adminCheck(message)){
            let textOnly = true;
            message.attachments.forEach((key) => {
                if(key != null) {
                    textOnly = false;
                }
            });
            if (textOnly) {
                message.channel.send("Please post only images in this channel!").then(msg => {
                    setTimeout(() => {
                        msg.delete();
                    }, 5000);
                });
                message.author.send("Your message in #s-e-l-l-o-u-t got deleted, because that channel should only be used for showcasing Born Gosu merchandise!\n\"" + message.content + "\"");
                message.delete();
            }
        } else if (message.content[0] === prefix) {
            try {
                if (msg.substr(0, 4) === "help") {
                    manualPage(message.author.username);
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
                else if (adminCheck(message)) {
                    if (command[0] === "tryout") {
                        if (message.mentions.users.firstKey() !== undefined) {
                            try {
                                tryout(message.mentions.users, message.channel);
                            } catch (e) {
                                message.channel.send("An error has occurred.");
                                AsheN.send(e.toString());
                            }
                        } else {
                            message.channel.send("Please specify which user(s) to promote.");
                        }
                    }
                    else if (command[0] === "tfind"){
                        saveHandler.connect(message.mentions.users, saveHandler.tryouts.find);
                    }
                    else if (command[0] === "tstatus"){
                        tryoutStatus(message.author);
                    }
                    else if (command[0] === "tupdate") {
                        saveHandler.connect([message.mentions.users, command, message.channel], saveHandler.tryouts.update);
                    }
                    else if (command[0] === "treset"){
                        if(message.author === AsheN){
                            saveHandler.connect(message.channel, saveHandler.tryouts.reset);
                        } else {
                            message.channel.send("This command can only be used be used by AsheN.");
                        }
                    }
                    else if (command[0] === "promote") {
                        if (message.mentions.users.array().length > 0){
                            promote(message.mentions.users, message.channel);
                        }
                    }
                    else if (command[0] === "demote") {
                        if(message.mentions.users.array().length > 0){
                            demote(message.mentions.users, message.channel);
                        } else {
                            message.channel.send("No tryout(s) specified for demotion.");
                        }
                    }
                    else if (msg.substr(0, 6) === "submit") {
                        ctlLineup(msg.substr(7, msg.length));
                        //done(message.channel);
                        channel.send("Done.").then(msg =>  setTimeout(() => { msg.delete() }, 5000));
                    }
                    else if (msg.substr(0, 5) === "races") {
                        lineupRaces(msg.substr(6, msg.length));
                        //done(message.channel);
                        channel.send("Done.").then(msg =>  setTimeout(() => { msg.delete() }, 5000));
                    }
                    else if (msg.substr(0, 8) === "profiles") {
                        ctlProfile(msg.substr(8, msg.length));
                        //done(message.channel);
                        channel.send("Done.").then(then(msg =>  setTimeout(() => { msg.delete() }, 5000)));
                    }
                    /*else if (msg.substr(0, 6) === "update") {
                        if (msg.substr(7, 5) === "score") {

                        } else {
                            ctlTopic(teamIGN, "", msg.substr(7, 1), msg.substr(9, msg.length));
                        }
                        //done(message.channel);
                        channel.send("Done.");
                    }*/
                    else if (command[0] === "lineups") {
                        let week = command[1];
                        let side = command[2];
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
                        switch (week){
                            case "p1":
                                outputStr = "__**CTL Lineups Playoffs Week 1:**__\n\n";
                                break;
                            case "p2":
                                outputStr = "__**CTL Lineups Playoffs Week 2:**__\n\n";
                                break;
                            case "p3":
                                outputStr = "__**CTL Lineups Playoffs Week 3:**__\n\n";
                                break;
                            default:
                                outputStr = "__**CTL Lineups Week " + week + ":**__\n\n";
                                break;
                        }
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
                                "\nLink(s):\n" + sc2unmaskedLink + enemyIGN[index].trim() + "\n" + ctlProfiles[index] + "\n\n";
                        });
                        ctlTopic(teamIGN, week);
                        outputStr += "**GLHF everyone!** " + server.roles.find("name", "CTL Players");
                        channel.send(outputStr)
                            .then(msg => {
                                msg.pin();
                                });
                        channel.send(ctlStepsMessage).then(msg => {
                            msg.pin();
                        });
                    }
                // Not admin
                } else if(["submit", "races", "profiles", "lineups", "promote", "tryout", "tupdate", "tstatus"].includes(command[0])) {
                    message.channel.send("Shoo, you don't have the permissions!").then(msg =>  setTimeout(() => { msg.delete() }, 5000));
                }
            } catch (e) {
                message.channel.send("error with: " + command[0]);
                AsheN.send(e.toString());
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
        try {
            if (mia && message.isMentioned(AsheN)) {
                AsheN.send(message.author.username + ":" + message.content);
                message.channel.send("Your message has been relayed. AsheN might not be able to reply Soon:tm:");
            }
        } catch (e) {}
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

function tryout(user, channel){
    user = user.array();
    let tryoutMembers = [], tryouts = [], nontryouts = [];
    let roles = server.roles;
    let err = false, foreachcounter = 0;
    let tryoutInfo = "After filling out our recruitment application you have now been given the Tryout Role which represents a trial period in the team. You will continue to have this role for about 1-3 weeks ( depending on your activity ), In that time you can make yourself a part of the community while we review your application! \n" +
        "\n" +
        "We adopt the system of trial membership before official membership to filter out trolls / inactive members out of the team, you can expect a fast promotion if you're active in our discord community and participate in clan-wars,pratice games, team leagues etc. If you have any questions regarding the team in general or your membership feel free to let us know ^^ \n"+
        "\n" + "Also, please check out the channel with the name '#channels-roles-faq' where you can assign yourself your own race/league tags!" +
        "\n\n" + "_(P.S. I'm a bot.)_";

    user.forEach((tryout, index) => {
        tryoutMembers.push(client.users.find("id", tryout.id));
        let guildMember = server.member(tryoutMembers[index]);
        foreachcounter++;
        if((guildMember.roles.find("name", "Tryout Member")) === null) {
            nontryouts.push(tryout);
            guildMember.addRole(roles.find("name", "Tryout Member").id);
            guildMember.removeRole(roles.find("name", "Non-Born Gosu").id);
            try {
                saveHandler.connect(server.members.find('id', tryout.id), saveHandler.tryouts.add);
                client.users.find("id", tryout.id).send(tryoutInfo);
            } catch (e) {
                AsheN.send(e.toString());
                err = true;
            }
        } else {
            tryouts.push(tryout.username);
        }
        if(foreachcounter === user.length && !err){
            if(nontryouts.length > 0) {
                server.channels.find("name", "bg-lounge").send("Welcome our newest **Tryout member" + ((nontryouts.length > 1) ? "s" : "") + "**! " + nontryouts + " @here\n" +
                    "Please check out the " + server.channels.find(channel => channel.name === "channels-roles-faq").toString() + " to get yourselves your own Race & League tags!");
            }
            if(tryouts.length > 0) {
                channel.send("User"+((tryouts.length > 1) ? "s" : "")+": " + tryouts + ((tryouts.length>1) ? "are already tryouts." : "is already a tryout."));
            }
        }
    });
}

function tryoutStatus(user){
    try {
        saveHandler.connect(user, saveHandler.tryouts.status);
    } catch (e){
        user.send(e.toString());
        AsheN.send(e.toString());
    }
}

function promote(user, channel){
    user = user.array();
    let tryoutMembers = [], tryouts = [], member = [];
    let roles = server.roles;
    let err = false, foreachcount = 0;

    user.forEach((tryout, index) => {
        tryoutMembers.push(client.users.find("id", tryout.id));
        let guildMember = server.member(tryoutMembers[index]);
        foreachcount++;
        if((guildMember.roles.find("name", "Born Gosu")) === null) {
            tryouts.push(tryout);
            guildMember.addRole(roles.find("name", "Born Gosu").id);
            guildMember.removeRole(roles.find("name", "Tryout Member").id);
            try {
                saveHandler.connect(tryout.id, saveHandler.tryouts.remove);
            } catch (e) {
                AsheN.send(e.toString());
                err = true;
            }
        } else {
            member.push(tryout.username);
        }
        if ((foreachcount === user.length) && !err) {
            if(tryouts.length > 0) server.channels.find("name", "bg-lounge").send("Welcome our newest **Born Gosu member" + ((user.length > 1) ? "s" : "") + "**! " + tryouts + " @here");
            if(member.length > 0) channel.send("User" + ((member.length > 1) ? "s" : "") + ": " + member + ((member.length > 1) ? " are already members." : " is already a member."));
        }
    });
}

function demote(users, channel) {
    let tryoutRoleId = server.roles.find("name", "Tryout Member").id;
    let demoted = false;
    users.forEach(tryout => {
        if(server.members.find("id", tryout.id) !== null){
            let guildMember = server.member(client.users.find("id", tryout.id));
            guildMember.addRole(server.roles.find("name", "Non-Born Gosu").id);
            guildMember.removeRole(server.roles.find("id", tryoutRoleId));
            demoted = true;
            saveHandler.connect(tryout.id, saveHandler.tryouts.remove);
        }
    });
    if(!demoted) {
        channel.send("No tryout(s) specified for demotion.");
    }
}

function adminCheck(message) {
    return (!!message.author.lastMessage.member.roles.find('name', 'Admins')) || (message.author.lastMessage.member.id === "96709536978567168") || message.author === AsheN;
}

function done(channel){
    channel.send("Done.")
        .then(() => channel.fetchMessages({limit:1})
            .then(messages => {
                setTimeout(function(){
                    messages = messages.array();
                   // messages[0].delete();
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
        .setDescription("How to use:\n 1) submit \n 2) races\n 3) profiles\n 4) lineups\n\n**Please watch for double whitespaces when copy-pasting stuff!**")
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
            "Available parameters: z, t, p, n (Zerg, Terran, Protoss, None)\n"+
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
        .addField("lineups", "Syntax: "+prefix+"lineups _week-number/(p1/2/3)_ 'left/right (which side BG is on the CTL post)'\n" +
            "Example: "+prefix+"lineups 8 left\n" +
            "Example: "+prefix+"lineups 1 right\n" +
            "Example: "+prefix+"lineups p2 left")
        .addBlankField(true)
        .addBlankField(true)
        .addField("Other Commands", prefix+"update _set-number_ _w/l/status_\n" +
            prefix+"promote @user1 @user2\n" +
            "If you need more detailed information please message AsheN!")
        .addBlankField(true)
        .addBlankField(true)
        .addField("tryout", "Syntax: "+prefix+"tryout _tag user_\n" +
            "Example: "+prefix+"tryout @ashen\n"+
            "Example: "+prefix+"tryout @ashen @psyrex @yeezus\n")
        .addBlankField(true)
        .addField("tryout commands (admin only)", prefix+"tstatus _shows tryout infos_\n" +
            prefix+"tupdate @user1 @user2 _tryoutsince:_ _YYYY-MM-DD_\n")
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
            prefix+"ashencoins\n"+
            prefix+"ashenpoints\n");
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
