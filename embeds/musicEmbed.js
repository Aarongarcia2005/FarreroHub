const { EmbedBuilder } = require("discord.js");
const config = require("../config/config");

function musicEmbed(state = "🎵 Panel de música") {
    return new EmbedBuilder()
        .setColor(config.colors.secondary)
        .setTitle("🎵 Farrero Music")
        .setDescription("Controla la reproducción, la cola y los sonidos del bot desde un único panel.")
        .addFields(
            { name: "Estado", value: state },
            { name: "Controles", value: "Play • Pause • Stop • Skip • Volumen" },
            { name: "Fuente", value: "YouTube, playlists o archivos locales" }
        )
        .setFooter({ text: "Farrero Hub • Música" });
}

module.exports = musicEmbed;