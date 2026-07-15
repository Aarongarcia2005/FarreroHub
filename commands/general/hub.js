const { SlashCommandBuilder } = require("discord.js");
const homeEmbed = require("../../embeds/homeEmbed");
const homeButtons = require("../../buttons/homeButtons");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hub")
    .setDescription("Abre el panel principal de Farrero Hub"),
  async execute(interaction) {
    await interaction.reply({
      embeds: [homeEmbed()],
      components: homeButtons(),
      fetchReply: true
    });
  }
};