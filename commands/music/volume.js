const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Ajusta el volumen de la reproducción")
    .addIntegerOption((option) =>
      option.setName("valor").setDescription("Valor del volumen entre 0 y 100").setRequired(true)
    ),
  async execute(interaction) {
    const value = interaction.options.getInteger("valor");
    await interaction.client.musicService.setVolume(interaction, value);
  }
};
