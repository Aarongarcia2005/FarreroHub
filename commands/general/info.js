const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Muestra información sobre Farrero Hub"),
  async execute(interaction) {
    await interaction.reply({
      embeds: [
        {
          title: "🩷 Farrero Hub",
          description: "Bot profesional de música y entretenimiento para Farrero FC.",
          color: 0xff4fa3,
          fields: [
            { name: "Versión", value: config.bot.version },
            { name: "Estado", value: "Activo" }
          ]
        }
      ]
    });
  }
};
