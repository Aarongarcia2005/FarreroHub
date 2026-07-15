const { EmbedBuilder } = require("discord.js");
const config = require("../config/config");

function homeEmbed() {

    return new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle("🩷 Farrero Hub 💙")
        .setDescription(
`## Bienvenido a Farrero Hub

🏕️ Centro multimedia oficial de Farrero FC

━━━━━━━━━━━━━━━━━━

🎵 **Música**
Reproduce canciones y playlists.

📂 **MP3**
Tus himnos y sonidos personalizados.

⚽ **Partido**
Himno, gol y celebración.

━━━━━━━━━━━━━━━━━━

🎶 **Estado**
Nada reproduciéndose.

🔊 **Volumen**
100%

👥 **Canal de voz**
No conectado.`
        )
        .setFooter({
            text: "Farrero Hub • v1.0.0"
        });

}

module.exports = homeEmbed;