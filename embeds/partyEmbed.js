const { EmbedBuilder } = require("discord.js");
const config = require("../config/config");

function partyEmbed() {
  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle("⚽ Panel Partido")
    .setDescription("Controla los sonidos del partido en un solo panel.")
    .addFields(
      { name: "🎶 Himno", value: "Activa el himno del club." },
      { name: "⚽ Gol", value: "Reproduce el gol del equipo." },
      { name: "🎉 Celebración", value: "Envía la celebración del momento." }
    )
    .setFooter({ text: "Farrero Hub • Partido" });
}

module.exports = partyEmbed;
