const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gol")
    .setDescription("Reproduce el efecto de gol"),
  async execute(interaction) {
    await interaction.reply({ content: "⚽ ¡Gol!", ephemeral: true });
  }
};
