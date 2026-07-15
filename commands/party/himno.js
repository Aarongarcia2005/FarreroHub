const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("himno")
    .setDescription("Reproduce el himno de Farrero FC"),
  async execute(interaction) {
    await interaction.client.musicService.play(interaction, "himno.mp3");
  }
};
