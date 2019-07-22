// VARIABLES
let localConfig;
try { localConfig = require("./modules/localconfig"); } catch (e) { }
let dbHandler;
try { dbHandler = require("./modules/mongoDB"); } catch (e) { }

const Discord = require("discord.js");
const client = new Discord.Client();
const _ = require("underscore");
const moment = require("moment");

const online = false; // true = online, false = debugging/running locally

const VARS = {
    server: '',
    bgServerName: 'Born Gosu Gaming',
    bgMemberTagName: 'Born Gosu',
    nonBgMemberTagName: 'Non-Born Gosu',
    tryoutTagName: 'Tryout Member',
    pantsuServerName: 'Pantsu',
    AsheN: "105301872818028544",
    reactionRoleMenus: {
        race: '602559401919905952', //'466648565415018507',
        league: '602559407137751053', //'466648570116702208',
        other: '602559411516342275', // '487776565942288415',
        reset: '602559416100716560', //'466648527544778753',
    },
    lastUser: '',
    sc2UnmaskedLink: "http://sc2unmasked.com/Search?q="
};

const monthNames = [
    "January",
    "Feburary",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

const CTL_VARS = {
    ctlCounter: '',
    ctlLastMessageID: '',
    ctlLastMessageChannel: '',
    lineupMessage: "",
    topicMessage: "",
    ctlStepsMessage: "Hey guys, Welcome to the CTL Week, thank you for participating in this and I wish you all luck and enjoy!\n" +
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
        "Fifth, **reporting the outcome of the game**. After the game, you will then have to let us know of the result and in case of a win, we would need the replay too to get credibility for that win.",

};

const CHANNELS = {
    ctlChannel: '',
    botChannel: "bot-channel"
};

const ROLES = {
    raceTags: ["Terran", "Protoss", "Zerg", "Random"],
    leagueTags: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"],
    otherTags: ["Coop", "Osu", "Pathofexile"]
};

const forbiddenChannels = [
    "announcements",
    "bg-events",
    "ashenchat",
    "pantsuhouse",
    "s-e-l-l-o-u-t",
    "events"
];

const SYSTEM = {
    prefix: online ? process.env.PREFIX : localConfig.PREFIX,
};



// DISCORD MAIN

client.on("ready", () => {
    try {
        VARS.AsheN = client.users.find(user => _.isEqual(user.id, VARS.AsheN));
    } catch (e){}

    client.user.setUsername("Ashley").then();
    VARS.server = client.guilds.find(guild => _.isEqual(guild.name, (online) ? VARS.bgServerName : VARS.pantsuServerName));

    try {
       // VARS.server.channels.find(channel => _.isEqual(channel.name, "bot-channel")).send("I'M AWAKE.");
    } catch (e) { VARS.AsheN.send(e.toString()); }

    CHANNELS.ctlChannel = VARS.server.channels.find(channel => _.isEqual(channel.name, "ctl"));

    FUNCTIONS.setupReactionRoles();
});




// MAIN FUNCTIONS

const FUNCTIONS = {
    setupReactionRoles: function () {
        try {
            let roles = VARS.server.roles;
            let rolesChannel = VARS.server.channels.find(channel => _.isEqual(channel.name, "channels-roles-faq"));
            let emojis = VARS.server.emojis;
            let raceTagMessage;
            let leagueTagMessage;
            let otherTagMessage;
            // Race
            rolesChannel.fetchMessage(VARS.reactionRoleMenus.race).then(message => {
                raceTagMessage = message;

                // Add race emotes in order
                message.react(emojis.find(emoji => _.isEqual(emoji.name, "Terran")).id).then(() => {
                    message.react(emojis.find(emoji => _.isEqual(emoji.name, "Protoss")).id).then(() => {
                        message.react(emojis.find(emoji => _.isEqual(emoji.name, "Zerg")).id).then(() => {
                            message.react(emojis.find(emoji => _.isEqual(emoji.name, "Random")).id).then();
                        });
                    });
                });

                message.awaitReactions((r, u) => {
                    if (_.isEqual(u, client.user)) { return; }
                    let reaction = r._emoji.name;
                    let user = VARS.server.members.find(member => _.isEqual(member.id, u.id));
                    if(user.roles.find(role => _.isEqual(role.name, VARS.nonBgMemberTagName)) !== null) {
                        r.remove(user);
                        return;
                    }
                    reaction = reaction[0].toUpperCase() + reaction.substr(1).toLowerCase();
                    if (ROLES.raceTags.includes(reaction)){
                        try {
                            if(user.roles.find(role => _.isEqual(role.name, reaction)) !== null){
                                user.removeRole(roles.find(role => _.isEqual(role.name, reaction)).id).then();
                                r.remove(user);
                            } else {
                                user.addRole(roles.find(role => _.isEqual(role.name, reaction)).id).then();
                            }
                        } catch (e) { VARS.AsheN.send(e.toString()); }
                    }
                }).then();
            }).catch(console.error);

            // League
            rolesChannel.fetchMessage(VARS.reactionRoleMenus.league).then(message => {
                leagueTagMessage = message;

                // Add league emotes in order
                message.react(emojis.find(emoji => _.isEqual(emoji.name, "Bronze")).id).then( () => {
                    message.react(emojis.find(emoji => _.isEqual(emoji.name, "Silver")).id).then(() => {
                        message.react(emojis.find(emoji => _.isEqual(emoji.name, "Gold")).id).then(() => {
                            message.react(emojis.find(emoji => _.isEqual(emoji.name, "Platinum")).id).then(() => {
                                message.react(emojis.find(emoji => _.isEqual(emoji.name, "Diamond")).id).then(() => {
                                    message.react(emojis.find(emoji => _.isEqual(emoji.name, "Master")).id).then();
                                });
                            });
                        });
                    });
                });

                message.awaitReactions((r, u) => {
                    if (_.isEqual(u, client.user)) { return; }
                    let reaction = r._emoji.name;
                    let user = VARS.server.members.find(member => _.isEqual(member.id, u.id));
                    if(user.roles.find(role => _.isEqual(role.name, VARS.nonBgMemberTagName)) !== null) {
                        r.remove(user);
                        return;
                    }
                    reaction = reaction[0].toUpperCase() + reaction.substr(1).toLowerCase();
                    if (ROLES.leagueTags.includes(reaction)){
                        try {
                            if(user.roles.find(role => _.isEqual(role.name, reaction)) !== null){
                                user.removeRole(roles.find(role => _.isEqual(role.name, reaction)).id).then();
                                r.remove(user);
                            } else {
                                user.addRole(roles.find(role => _.isEqual(role.name, reaction)).id).then();
                                ROLES.leagueTags.forEach(league => {
                                    try {
                                        if(reaction !== league){
                                            user.removeRole(roles.find(role => _.isEqual(role.name, league)).id).then();
                                        }
                                    } catch (e) { VARS.AsheN.send(e.toString()); }
                                });
                                message.reactions.forEach((mreaction, index) => {
                                    if(reaction !== index.split(":")[0]) mreaction.remove(user).then();
                                });
                            }
                        } catch (e) { VARS.AsheN.send(e.toString()); }
                    }
                }).then();
            }).catch(console.error);

            // ❌
            rolesChannel.fetchMessage(VARS.reactionRoleMenus.reset).then(message => {
                try {
                    message.react("❌").then();
                } catch (e) { VARS.AsheN.send(e.toString()); }
                message.awaitReactions((r, u) => {
                    let reaction = r._emoji.name;
                    let user = VARS.server.members.find(member => _.isEqual(member.id, u.id));
                    if(user.roles.find(role => _.isEqual(role.name, VARS.nonBgMemberTagName)) !== null) {
                        r.remove(user);
                        return;
                    }
                    if (reaction === "❌"){
                        user.roles.forEach(role => {
                            if (role.name === "Path of Exile") {
                                role.name = "Pathofexile";
                            }
                            if (ROLES.leagueTags.includes(role.name) || ROLES.raceTags.includes(role.name) || ROLES.otherTags.includes((role.name))) {
                                try{
                                    user.removeRole(role.id).then();
                                } catch (e) { VARS.AsheN.send(e.toString()); }
                            }
                        });
                        raceTagMessage.reactions.forEach(reaction => reaction.remove(user));
                        leagueTagMessage.reactions.forEach(reaction => reaction.remove(user));
                        otherTagMessage.reactions.forEach(reaction => reaction.remove(user));
                    }
                }).then();
            }).catch(console.error);

            // Other - Coop, Osu, Path of Exile ...
            rolesChannel.fetchMessage(VARS.reactionRoleMenus.other).then(message => {
                otherTagMessage = message;
                message.react(emojis.find(emoji => _.isEqual(emoji.name, "Coop")).id).then(() => {
                    message.react(emojis.find(emoji => _.isEqual(emoji.name, "Osu")).id).then(() => {
                        message.react(emojis.find(emoji => _.isEqual(emoji.name, "Pathofexile")).id).then();
                    });
                });
                message.awaitReactions((r, u) => {
                    if (_.isEqual(u, client.user)) { return; }
                    let reaction = r._emoji.name;
                    let user = VARS.server.members.find(member => _.isEqual(member.id, u.id));
                    if (ROLES.otherTags.includes(reaction)){
                        try {
                            if(user.roles.find(role => _.isEqual(role.name, (reaction === "Pathofexile") ? "Path of Exile" : reaction)) !== null){
                                message.reactions.forEach((mreaction, index) => {
                                    if(reaction === index.split(":")[0]) mreaction.remove(user);
                                });
                                if (reaction === "Pathofexile") {
                                    reaction = "Path of Exile";
                                }
                                user.removeRole(roles.find(role => _.isEqual(role.name, reaction)).id).then();
                            } else {
                                reaction = reaction[0].toUpperCase() + reaction.substr(1).toLowerCase();
                                if (reaction === "Pathofexile") {
                                    reaction = "Path of Exile";
                                }
                                user.addRole(roles.find(role => _.isEqual(role.name, reaction)).id).then();
                            }
                        } catch (e) { console.log(e); }
                    }
                }).then();
            }).catch(console.error);
        } catch (e) { VARS.AsheN.send(e.toString()); }
    }
};

// HELPER FUNCTIONS
const _dateToString = function(date){
    let dateString = monthNames[new Date(date).getMonth()] + " " + new Date(date).getDate() + ", " + new Date(date).getFullYear();
    return dateString;
};
const _getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
const _dateDiffInDays = function(date1, date2) {
    let diff = Date.parse(date1) - Date.parse(date2);
    return Math.floor(diff / (24 * 60 * 60 * 1000));
};

client.login(online ? process.env.BOT_TOKEN : localConfig.BOT_TOKEN).then();