const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Detiene la reproducción actual"),
  async execute(interaction) {
    await interaction.client.musicService.stop(interaction);
  }
};
