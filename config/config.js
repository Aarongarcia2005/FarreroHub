require("dotenv").config();

module.exports = {
    token: process.env.DISCORD_TOKEN || process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,

    colors: {
        primary: "#ff4fa3",
        secondary: "#4da6ff"
    },

    bot: {
        name: "Farrero Hub",
        version: "1.0.0"
    }
};