const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = "_";
let races = [], teamLineup = [], league = [], ctlProfiles = [], enemyIGN = [], teamIGN = [], score = [], topic;
const sc2unmaskedLink = "http://sc2unmasked.com/Search?q=";
let channel = "";

client.on("ready", () => {
     client.user.setUsername("Ashley");
    channel = client.guilds.find("name","Born Gosu Gaming").channels.find("name", "ctl");
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
        if (message.content[0] === process.env.PREFIX) {
            if(msg.substr(0, 4) === "help"){
                manualPage(message.author.username);
                return;
            }
            if (msg.substr(0, 4) === "ping") {
                message.reply("pang");
            }
            if(adminCheck(message.author.lastMessage.member.roles.find('name', 'Admins'))){
                if (msg.substr(0, 6) === "submit") {
                    ctlLineup(msg.substr(7, msg.length));
                    done(message.channel);
                }
                else if(msg.substr(0, 5) === "races"){
                    lineupRaces(msg.substr(6, msg.length));
                    done(message.channel);
                }
                else if(msg.substr(0, 8) === "profiles"){
                    ctlProfile(msg.substr(8, msg.length));
                    done(message.channel);
                }
                else if(msg.substr(0, 6) === "update"){
                    if(msg.substr(7, 5) === "score"){

                    } else {
                        ctlTopic(teamIGN, "", msg.substr(7, 1), msg.substr(9, msg.length));
                    }
                    done(message.channel);
                }
                else if (msg.substr(0, 7) === "lineups") {
                    var week = msg.substr(8, 1);
                    var side = msg.substr(10, 7);
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
                    done(message.channel);
                    outputStr = "__**CTL Lineups Week "+ week +":**__\n";
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
        topic = "CTL Week " + week + " - Score: "+ score[0] + "-" + score[1] +"\n";
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
        .setTitle("This is your title, it can hold 256 characters")
        .setAuthor("Author Name", "https://i.imgur.com/lm8s41J.png")
        /*
         * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
         */
        .setColor(0x00AE86)
        .setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("This is the footer text, it can hold 2048 characters", "http://i.imgur.com/w1vhFSR.png")
        .setImage("http://i.imgur.com/yVpymuV.png")
        .setThumbnail("http://i.imgur.com/p2qNFag.png")
        /*
         * Takes a Date object, defaults to current date.
         */
        .setTimestamp()
        .setURL("https://discord.js.org/#/docs/main/indev/class/RichEmbed")
        .addField("This is a field title, it can hold 256 characters",
            "This is a field value, it can hold 2048 characters.")
        /*
         * Inline fields may not display as inline if the thumbnail and/or image is too big.
         */
        .addField("Inline Field", "They can also be inline.", true)
        /*
         * Blank field, useful to create some space.
         */
        .addBlankField(true)
        .addField("Inline Field 3", "You can have a maximum of 25 fields.", true);
    // Intro
    /*
    client.users.find("username", username).send({
        embed: {
            color: 3447003,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL
            },
            title: "This is an embed",
            url: "http://google.com",
            description: "This is a test embed to showcase what they look like and what they can do.",
            fields: [{
                name: "Fields",
                value: "They can have different fields with small headlines."
            },
                {
                    name: "Masked links",
                    value: "You can put [masked links](http://google.com) inside of rich embeds."
                },
                {
                    name: "Markdown",
                    value: "You can put all the *usual* **__Markdown__** inside of them."
                }
            ],
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: "© Example"
            }
        }
    });
*/
    // How to use
    //client.users.find("username", username).send(embed);
    client.users.find("username", username).send("In Progress >.> sorry please ask AsheN for more Information!");
}
client.login(process.env.BOT_TOKEN);