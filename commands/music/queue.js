const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Muestra la cola de reproducción"),
  async execute(interaction) {
    const queue = interaction.client.musicService.getQueue(interaction);
    const tracks = queue?.songs?.slice(0, 8).map((song, index) => `${index + 1}. ${song.name}`) || ["La cola está vacía."];

    await interaction.reply({
      embeds: [{
        title: "🎵 Cola de reproducción",
        description: tracks.join("\n"),
        color: 0x4da6ff
      }]
    });
  }
};
