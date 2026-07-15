module.exports = async (interaction) => {
  if (!interaction.isButton()) return;

  const delta = interaction.customId === "volume_down" ? -10 : 10;
  await interaction.client.musicService.adjustVolume(interaction, delta);
};
