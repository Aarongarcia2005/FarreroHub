const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pausa la reproducción actual"),
  async execute(interaction) {
    await interaction.client.musicService.pause(interaction);
  }
};
