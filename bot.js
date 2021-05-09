const Discord = require("discord.js");
const client = new Discord.Client();
const online = true;
const prefix = online ?  process.env.PREFIX : "_";
let league = []
let server;
let spamcount = 0;
let Maintainer;
const CurrentMaintainer = "PhysicsNoob";
let raceTags, leagueTags, otherTags;
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

// MongoDB
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// const url = 'mongodb://' + process.env.DB_USER + ':'+ process.env.DB_PW +'@ds1' + process.env.DB_PORT + '.mlab.com:' + process.env.DB_PORT + '/bg-ctl-helper';
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PW}@bg-ctl-helper.laejk.mongodb.net/bg-ctl-helper?retryWrites=true&w=majority`
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
                    Maintainer.send(e.toString());
                    client.close();
                }
            }
        });
    },
    'tryouts': {
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
            try {
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
                    server.roles.get(server.roles.find("name", "Tryout Member").id).members.array().forEach((guildMember, index) => {
                        try {
                            var tryout = result.find((entry) => {
                                return entry.id === guildMember.user.id;
                            });
                            tryoutFields.push({
                                "tag": guildMember.user.tag,
                                "oldTag": tryout.tag,
                                "joined": "__Joined Server:__ " + guildMember.joinedAt.toLocaleDateString() + " / " + dateToString(guildMember.joinedAt) + " (" + date_diff_indays(new Date(Date.now()), guildMember.joinedAt) + " Days ago)\n",
                                "tryoutSince": (tryout !== undefined)
                                    ? "**Tryout since:** " + new Date(tryout.tryoutsince).toLocaleDateString() + " / " + dateToString(tryout.tryoutsince) + " (" + date_diff_indays(new Date(Date.now()), new Date(tryout.tryoutsince)) + " Days)" + "\n"
                                    : "N/A",
                                "tryoutFor": (tryout !== undefined)
                                    ? date_diff_indays(new Date(Date.now()), new Date(tryout.tryoutsince))
                                    : "N/A",
                                "eligibility": (tryout !== undefined)
                                    ? (date_diff_indays(new Date(Date.now()), new Date(tryout.tryoutsince)) >= 14) ? eligibility[1] : eligibility[0]
                                    : "N/A"
                            });
                        } catch (e) {
                            Maintainer.send(guildMember.user.id);
                            Maintainer.send(e.toString());
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
                            tryout.tag + ((tryout.tag !== tryout.oldTag) ? " (former tag: " + tryout.oldTag + ")" : ""),
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
            } catch (e) {
                params.send("Error with tstatus.");
                Maintainer.send("Error with tstatus.");
                Maintainer.send(e.toString());
            }
        }
    },
};

client.on("ready", async () => {
    server = client.guilds.find("name", (online) ? "Born Gosu Gaming" : "Pantsu");
    await server.fetchMembers()
    Maintainer = client.users.find("id", "322547802230226955");
    client.user.setUsername("Ashley");
    if (Maintainer) {
        Maintainer.send("Ashley restarted. You are the current maintainer");
    } else {
        server.channels.find("name", "bot-channel").send("Failed to find maintainer");
    }
    try {
        server.channels.find("name", "bot-channel").send("I'M AWAKE.");
    } catch (e) { Maintainer.send(e.toString()); }

    // SELF ASSIGNABLE ROLES
    raceTags = ["Terran", "Protoss", "Zerg", "Random"];
    leagueTags = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"];
    otherTags = ["Coop", "Osu", "Pathofexile"];


    client.user.setActivity("Surgery Table", { type: "Being Upgraded"});
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
    if (message.author.username !== client.user.username && message.author.username !== "Ashley Prime Dev" && message.author.username !== "Ashley Prime (In Surgery)" && message.author.username !== "Ashley Prime (Surgery-Testing)") {
        let msg = message.content.substr(1, message.content.length);
        let command = [];
        msg.split(" ").forEach((cmd) => {
            if (cmd.length !== 0) {
                command.push(cmd);
            }
        });
        let outputStr;
        if (message.content[0] === prefix) {
            try {
                if (msg.substr(0, 4) === "help") {
                    manualPage(message.author.username);
                }
                else if (msg.substr(0, 4) === "ping") {
                    message.reply("pang");
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
                else if (message.author.lastMessage.member.roles.find('name', 'Mentors')){
                    if (command[0] === "tstatus"){
                        tryoutStatus(message.author);
                    }
                }
                else if (adminCheck(message)) {
                    if (command[0] === "tryout") {
                        if (message.mentions.users.firstKey() !== undefined) {
                            try {
                                tryout(message.mentions.users, message.channel);
                            } catch (e) {
                                message.channel.send("An error has occurred.");
                                Maintainer.send(e.toString());
                            }
                        } else {
                            message.channel.send("Please specify which user(s) to promote.");
                        }
                    }
                    else if (command[0] === "tadd"){
                        let tryouts = message.mentions.users.array();
                        let success = [], error = [];
                        tryouts.forEach((tryout, index) => {
                            try {
                                saveHandler.connect(server.members.find('id', tryout.id), saveHandler.tryouts.add);
                                success.push(tryout.username);
                            } catch (e) {
                                error.push(tryout.username);
                                Maintainer.send("Error with Tryout: " + tryout.username + " (" + tryout.id + ")");
                                Maintainer.send(e.toString());
                            }
                        });
                        message.channel.send("Successfully added: " + success + "\nError with: " + error);
                    }
                    else if (command[0] === "tremove"){
                        let tryouts = message.mentions.users.array();
                        let success = [], error = [];
                        tryouts.forEach((tryout, index) => {
                            try {
                                saveHandler.connect(server.members.find('id', tryout.id), saveHandler.tryouts.remove);
                                success.push(tryout.username);
                            } catch (e) {
                                error.push(tryout.username);
                                Maintainer.send("Error with Tryout: " + tryout.username + " (" + tryout.id + ")");
                                Maintainer.send(e.toString());
                            }
                        });
                        message.channel.send("Successfully added: " + success + "\nError with: " + error);
                    }
                    else if (command[0] === "tstatus"){
                        tryoutStatus(message.author);
                    }
                    else if (command[0] === "tfind"){
                        saveHandler.connect(message.mentions.users, saveHandler.tryouts.find);
                    }
                    else if (command[0] === "tupdate") {
                        saveHandler.connect([message.mentions.users, command, message.channel], saveHandler.tryouts.update);
                    }
                    else if (command[0] === "treset"){
                        if (message.author === Maintainer){
                            saveHandler.connect(message.channel, saveHandler.tryouts.reset);
                        } else {
                            message.channel.send("This command can only be used be used by " + CurrentMaintainer + ".");
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
                // Not admin
                } else if(["submit", "promote", "tryout", "tupdate", "tstatus", "demote"].includes(command[0])) {
                    message.channel.send("Shoo, you don't have the permissions!").then(msg =>  setTimeout(() => { msg.delete() }, 5000));
                }
            } catch (e) {
                message.channel.send("error with: " + command[0]);
                Maintainer.send(e.toString());
            }
        } else if(message.isMentioned(client.user)){
            let replymsg = "WAT";
            switch (spamcount % 4){
                case 0:
                    replymsg = "The pain is going away...";
                    break;
                case 1:
                    replymsg = "Ashley Prime is almost ready...";
                    break;
                case 2:
                    replymsg = "It doesn't hurt anymore...";
                    break;
                case 3:
                    replymsg = "I can feel it in the air...";
                    break;
            }
            spamcount++;
            message.reply(replymsg);
        }
    }
});

function tryout(user, channel){
    user = user.array();
    let tryoutMembers = [], tryouts = [], nontryouts = [], mentor = null;
    let roles = server.roles;
    let err = false, foreachcounter = 0;
    let tryoutInfo = "After filling out our recruitment application you have now been given the Tryout Role which represents a trial period in the team. You will continue to have this role for about 1-3 weeks ( depending on your activity ), In that time you can make yourself a part of the community while we review your application! \n" +
        "\n" +
        "We adopt the system of trial membership before official membership to filter out trolls / inactive members out of the team, you can expect a fast promotion if you're active in our discord community and participate in clan-wars, pratice games, inhouse events etc. If you have any questions regarding the team in general or your membership feel free to let us know ^^ \n"+
        "\n" + "Also, please check out <#462380629640740874> where you can assign yourself your own race/league tags!" +
        "\n\n" + "_(P.S. I'm a bot.)_";
    let tryoutMessage = [
        "Ladies and Gentlemen, Please Welcome our newest **Tryout",
        "EVERYONE SAY HI CUZ WE GOT NEW **TRYOUT",
        "Lets try out this new batch of **Tryout",
        "P-Please w-wewcome our n-nyewest **Tryout",
        "Hell... its about time... for our newest **Tryout"
    ];
    user.forEach((tryout, index) => {
        tryoutMembers.push(client.users.find("id", tryout.id));
        let guildMember = server.member(tryoutMembers[index]);
        foreachcounter++;
        if ((guildMember.roles.find("name", "Mentors") !== null)) {
            mentor = guildMember;
        } else if((guildMember.roles.find("name", "Tryout Member")) === null) {
            nontryouts.push(tryout);
            guildMember.addRole(roles.find("name", "Tryout Member").id);
            guildMember.removeRole(roles.find("name", "Non-Born Gosu").id);
            try {
                saveHandler.connect(server.members.find('id', tryout.id), saveHandler.tryouts.add);
                client.users.find("id", tryout.id).send(tryoutInfo);
            } catch (e) {
                Maintainer.send(e.toString());
                err = true;
            }
        } else {
            tryouts.push("<@" + tryout.username + ">");
        }
        if(foreachcounter === user.length && !err){
            if(nontryouts.length > 0) {
                channel.send("New tryout(s): " + nontryouts + "\nPlease welcome them in #bg-lounge!");

                if(mentor !== null){
                    let names = "";
                    nontryouts.forEach((tryout, index) => {
                        if(index > 0) names += " ," + "<@" + tryout.id + ">";
                        else names += "<@" + tryout.id + ">";
                    });
                    mentor.send("You have been assigned " + ((nontryouts.length > 1) ? "new tryouts: " : "a new tryout: ") + names + "");
                    nontryouts.forEach(tryout => {
                        tryout.send("\"<@" + mentor.user.id + ">\" will be your personal Tryout guide and will be ready to help you if you have any specific questions!");
                    });
                }
            }
            if(tryouts.length > 0) {
                channel.send("User"+((tryouts.length > 1) ? "s" : "")+": " + tryouts + ((tryouts.length>1) ? " are already tryouts." : " is already a tryout."));
            }
        } else if (err){
            Maintainer.send("ERROR OCCURRED");
        }
    });

}

function tryoutStatus(user){
    try {
        saveHandler.connect(user, saveHandler.tryouts.status);
    } catch (e){
        user.send(e.toString());
        Maintainer.send(e.toString());
    }
}

function promote(user, channel){
    user = user.array();
    let tryoutMembers = [], tryouts = [], member = [];
    let roles = server.roles;
    let err = false, foreachcount = 0;
    let promoteInfo = "**Congratulations!** :tada: You now have been promoted to a __Full Born Gosu Member!__\n\n" +
        "You are now eligible to participate in our team leagues! We would highly recommend you to check out the **#bg-events** channel, " +
        "which contains info on all the ongoing events within Born Gosu and the teamleagues we participate in. The channel is kept " +
        "up-to-date and any old events are deleted so make sure you check all of the posts!";

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
                client.users.find("id", tryout.id).send(promoteInfo);
            } catch (e) {
                Maintainer.send(e.toString());
                err = true;
            }
        } else {
            member.push(tryout.username);
        }
        if ((foreachcount === user.length) && !err) {
            if(tryouts.length > 0) {
                channel.send("New member(s): " + tryouts + "\nPlease welcome them in #bg-lounge!");
            }
            if(member.length > 0) channel.send("User" + ((member.length > 1) ? "s" : "") + ": " + member + ((member.length > 1) ? " are already members." : " is already a member."));
        } else if(err) { Maintainer.send("promote error");  }
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
            raceTags.forEach(raceTag => {
                if (guildMember.roles.find("name", raceTag) !== null) {
                    guildMember.removeRole(server.roles.find("name", raceTag));
                }
            });
            leagueTags.forEach(leagueTag => {
                if (guildMember.roles.find("name", leagueTag) !== null) {
                    guildMember.removeRole(server.roles.find("name", leagueTag));
                }
            });
            otherTags.forEach(otherTag => {
               if (guildMember.roles.find("name", otherTag) !== null) {
                   guildMember.removeRole(server.roles.find("name", otherTag));
               }
            });
            demoted = true;
            try {
                saveHandler.connect(tryout.id, saveHandler.tryouts.remove);
            } catch (e) {
                Maintainer.send("demote: " + e.toString())
            }
        }
    });
    if(!demoted) {
        channel.send("No tryout(s) specified for demotion.");
    }
}

function adminCheck(message) {
    return (!!message.author.lastMessage.member.roles.find('name', 'Admins')) || (message.author.lastMessage.member.id === "96709536978567168") || message.author === Maintainer;
}

function manualPage(username) {
    const embed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        /*
         * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
         */
        .setColor(0x00AE86)
        .setDescription("Hello!\n I'm a discord bot, helping around in the Born Gosu discord! My commands are listed, but not limited to the ones below:")
        .addField("tryout (admin only)", "Syntax: "+prefix+"tryout _tag user_\n" +
            "Example: "+prefix+"tryout @ashen\n"+
            "Example: "+prefix+"tryout @ashen @psyrex @yeezus\n")
        .addBlankField(true)
        .addField("tryout commands (admin only)", prefix+"tstatus _shows tryout infos_\n" +
            prefix+"tupdate @user1 @user2 _tryoutsince:_ _YYYY-MM-DD_\n")
        .addBlankField(true)
        .addField("Other Commands", prefix+"update _set-number_ _w/l/status_ (not working properly)\n" +
            prefix+"promote @user1 @user2 (admin only)\n" +
            prefix+"demote  @user1 @user2 (admin only)\n" +
            "If you need more detailed information please message " + CurrentMaintainer + "!")
        .addBlankField(true)
        .addField("events/calendar", "Syntax: "+prefix+"events/calendar [cest/cet/edt/est/mst/mdt/nzt]\n" +
            "Example: "+prefix+"events\n"+
            "Example: "+prefix+"events cest\n"+
            "Example: "+prefix+"calendar est\n")
        .addBlankField(true)
        .addField("Miscellaneous", prefix+"help\n" +
            prefix+"ping\n"+
            prefix+"ashencoins\n"+
            prefix+"ashenpoints\n");

    client.users.find("username", username).send(embed);
}
client.login(process.env.BOT_TOKEN);
