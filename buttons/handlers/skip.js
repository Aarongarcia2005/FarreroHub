module.exports = async (interaction) => {
  if (!interaction.isButton()) return;
  await interaction.client.musicService.skip(interaction);
};
