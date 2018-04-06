const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
    console.log("I am ready!");
});

client.on("message", (message) => {
    if(message.content[0] === process.env.PREFIX){  
     message.content = message.content.substr(1, message.content.length);
        if (message.content === "ping"){
        message.reply("pong");
        }
        if (message.content === "message"){
        message.reply("success");
        message.reply(message.channel);
        }
    }
});

client.login(process.env.BOT_TOKEN);
