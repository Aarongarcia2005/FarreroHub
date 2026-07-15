const { EmbedBuilder } = require("discord.js");
const config = require("../config/config");

function settingsEmbed() {
  return new EmbedBuilder()
    .setColor(config.colors.secondary)
    .setTitle("⚙️ Ajustes")
    .setDescription("Panel de configuración y controles del bot.")
    .addFields(
      { name: "🔔 Notificaciones", value: "Gestiona mensajes del sistema." },
      { name: "🔐 Permisos", value: "Controla accesos y privilegios." },
      { name: "🛠️ Logs", value: "Consulta actividad y registros." }
    )
    .setFooter({ text: "Farrero Hub • Ajustes" });
}

module.exports = settingsEmbed;
