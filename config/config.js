// Load local .env only in non-production environments so Railway
// (or any production platform) can provide env vars directly.
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config(); // dev-only
}

// Export configuration using `process.env` directly. Avoid hardcoded tokens.
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