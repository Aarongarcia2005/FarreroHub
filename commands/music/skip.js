const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Salta a la siguiente canción"),
  async execute(interaction) {
    await interaction.client.musicService.skip(interaction);
  }
};
