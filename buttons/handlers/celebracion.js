module.exports = async (interaction) => {
  if (!interaction.isButton()) return;
  await interaction.reply({ content: "🎉 Celebración activada.", ephemeral: true });
};