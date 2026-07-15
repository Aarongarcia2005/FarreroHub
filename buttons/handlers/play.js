module.exports = async (interaction) => {
  if (!interaction.isButton()) return;

  const queue = interaction.client.musicService.getQueue(interaction);

  if (queue?.paused) {
    return interaction.client.musicService.resume(interaction);
  }

  await interaction.reply({ content: "🎵 Usa /play <canción> para iniciar reproducción.", ephemeral: true });
};
