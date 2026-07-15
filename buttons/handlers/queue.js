module.exports = async (interaction) => {
  if (!interaction.isButton()) return;
  const queue = interaction.client.musicService.getQueue(interaction);
  const tracks = queue?.songs?.slice(0, 8).map((song, index) => `${index + 1}. ${song.name}`) || ["La cola está vacía."];

  await interaction.reply({
    content: `🎵 Cola de reproducción:\n${tracks.join("\n")}`,
    ephemeral: true
  });
};
