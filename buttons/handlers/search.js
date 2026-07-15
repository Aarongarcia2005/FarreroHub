const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

module.exports = async (interaction) => {
  const modal = new ModalBuilder()
    .setCustomId("song_search_modal")
    .setTitle("Buscar canción");

  const songInput = new TextInputBuilder()
    .setCustomId("song_query")
    .setLabel("Escribe el nombre o enlace")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Ej: Never gonna give you up")
    .setRequired(true);

  const actionRow = new ActionRowBuilder().addComponents(songInput);
  modal.addComponents(actionRow);

  await interaction.showModal(modal);
};