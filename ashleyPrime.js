const ashley = require('./ashley/ashley')

let configObject = {}
if (process.env.CONFIG_PATH) {
  console.log(`Starting Ashley Prime with config path '${process.env.CONFIG_PATH}' (Local Mode)`)
  configObject = require(process.env.CONFIG_PATH)
} else {
  console.log(`Starting Ashley Prime with no config path (Production Mode)`)
  configObject = process.env
}

ashley({
  botToken: configObject.BOT_TOKEN,
  dbUser: configObject.DB_USER,
  dbPassword: configObject.DB_PW,
  dbPort: configObject.DB_PORT,
  dbName: configObject.DB_NAME,
  collectionName: configObject.DB_COLLECTION,
  serverName: configObject.DISCORD_SERVER_NAME,
  botName: configObject.DISCORD_BOT_NAME,
  maintainerId: configObject.MAINTAINER_DISCORD_ID,
  prefix: configObject.PREFIX,
})





























if (false) {
    const sc2unmaskedJs = require('./modules/sc2unmasked');
    const prefix = "$";
    let races = [], teamLineup = [], league = [], ctlProfiles = [], enemyIGN = [], teamIGN = [], score = [], topic;
    const sc2unmaskedLink = "http://sc2unmasked.com/Search?q=";
    let server;
    let channel = "";
    let spamcount = 0;
    let Maintainer;
    const CurrentMaintainer = "PhysicsNoob";
    let lastUser, ctlCounter, ctlLastMessageID, ctlLastMessageChannel, lineupMessage = "", topicMessage = "", allStarCounter = 0;
    let raceTags, leagueTags, otherTags;

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

    function ctlCommand(channel, params = false) {
        let responseText = new Discord.RichEmbed()
            .setColor([220, 20, 60])
            .setTitle("CTL Lineup Helper")
            .setDescription(
                "You have now started the **CTL Lineup Helper**.\n" +
                "In order to quit, simply reply with 'quit'.\n" +
                "If you need any help, please type " + prefix + "help for the docs.\n");
        if (params !== false) {
            switch (ctlCounter){
                case 0:
                    ctlLineup(params);
                    responseText
                        .addField("2) Races of the players", "Please enter the **first letters** of the races of the submitted players in the following Syntax:\n" +
                            "'_[Team 1 Player 1][Team 2 Player 1]_ _[Team 1 Player 2][Team 2 Player 2]_ ...'\n" +
                            "**Example**: zz pt rt np rz tt pz\n" +
                            "**Accepted Race Letters**: **[Z]**erg **[P]**rotoss **[T]**erran **[R]**andom **[N]**one");
                    break;
                case 1:
                    lineupRaces(params);
                    responseText
                        .addField("3) CTL Profile Links of Enemy Team's players", "Please enter the CTL Profile Links of the Enemy Team's players __separated with a New Line__.\n" +
                            "**Example**:")
                        .setImage("https://puu.sh/DYzns/52990c7f9f.png");
                    break;
                case 2:
                    ctlProfile(params);
                    responseText
                        .addField("4) CTL Week Number & Opponent", "Please enter the Week Number and the Enemy Team Name, as well as on which side Born Gosu is on.\n" +
                            "**Syntax**: [L/Left/R/Right] [Week/Playoffs] [Number] [Team Name](Team Tag, optional)\n" +
                            "**Example**: L Week 3 Validity Gaming [ValidG]\n" +
                            "**Example**: Right Playoffs 1 LiT\n");
                    break;
                case 3:
                    ctlSubmit(params);
                    responseText
                        .addField("5) Finalize", "Please check the information submitted for correctness.\n" +
                            "To submit, type 'submit'\n" +
                            "To cancel, type 'quit'\n");
                    channel.send(lineupMessage);
                    break;
                case 4:
                    if (params.toString().toLowerCase() === "submit"){
                        lineupMessage += "\n**GLHF everyone!** " + server.roles.find("name", "CTL Players");
                        channel = server.channels.find("name", "ctl");
                        channel.send(ctlStepsMessage).then(msg => {
                            msg.pin();
                        });
                        channel.send(lineupMessage).then(msg => {
                            msg.pin();
                        });
                        ctlTopic(teamIGN);
                    }
                    break;
            }
            if(ctlLastMessageID !== undefined) channel.fetchMessage(ctlLastMessageID).then(msg => msg.delete());

            if(ctlCounter < 4){
                channel.send(responseText).then(msg => {
                    ctlLastMessageID = msg.id;
                    ctlLastMessageChannel = msg.channel;
                });
                ctlCounter++;
            }
        } else {
            responseText
                .addField("1) Lineups from CTL Page", "Please enter the lineups from the CTL Page.\n" +
                    "**Example**:")
                .setImage("https://puu.sh/DYzl6/6546ceb67f.png");
            channel.send( responseText ).then(msg => {
                ctlLastMessageID = msg.id;
                ctlLastMessageChannel = msg.channel;
            });
            ctlCounter = 0;
        }
    }
}

function ctlSubmit(params){
    let side = params.split(" ")[0];
    params = params.replace(side + " ", "");
    let regex = /(week|playoff(s|)) [0-9]/gi;
    let week = params.match(regex);
    let oppTeam = params.replace(week + " ", "");
    topicMessage = "**CTL " + week + "** | Born Gosu vs __" + oppTeam + "__\n";
    lineupMessage = topicMessage;
    let teamRaces = [], enemyRaces = [];
    races.forEach(function (element, index) {
        if (index % 2 === 0) teamRaces.push(element);
        else enemyRaces.push(element);
    });
    teamLineup.forEach(function (element, index) {
        let coreStr = element.substr(0, element.indexOf("["));
        let left = coreStr.substr(0, coreStr.indexOf("|"));
        let right = coreStr.substr(coreStr.indexOf("vs. ") + 4, coreStr.substr(coreStr.indexOf("vs. "), coreStr.length).indexOf("|") - 4);
        if (side.toLowerCase()[0] === "r") {
            enemyIGN[index] = left;
            teamIGN[index] = right;
        } else {
            enemyIGN[index] = right;
            teamIGN[index] = left;
        }
        lineupMessage += league[index] + " " + teamRaces[index] + " " + coreStr +
            enemyRaces[index] + element.substr(element.indexOf("["), element.length) +
            "\nLink(s):\n" + sc2unmaskedLink + enemyIGN[index].trim() + "\n" + ctlProfiles[index] + "\n\n";
    });
}

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
    message.replace(/ /g,'');
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
        //topic = "CTL Week " + week + " - Score: "+ score[0] + "-" + score[1] +"\n";
        //topic = "CTL FINALS - Score: "+ score[0] + "-" + score[1] +"\n";
    }
    else {
        if(str.toLowerCase() === "w"){ score[0]++; }
        else if(str.toLowerCase() === "l") { score[1]++; }
        topic = channel.topic.substr(0, 10) + " - Score: " + score[0] + "-" + score[1] + "\n";
    }
    topic = topicMessage;
    team.forEach(function(element, index){
        if ((index + 1).toString() === set){
            if(str.toLowerCase() === "w"){ str = "Won"; }
            else if(str.toLowerCase() === "l") { str = "Lost"; }
            topic += "Set " + (index+1) + " - " + element + "- " + str + "\n";
        } else if(week !== "") {
            topic += "Set " + (index+1) + " - " + element + "- Time\n";
        } else {
            topic += "Set " + (index+1) + " - " + element + "- Time\n";
            // topic += channel.topic.split("\n")[index+1] + "\n";
        }
    });
    channel.setTopic(topic).then().catch(console.error);
}

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
