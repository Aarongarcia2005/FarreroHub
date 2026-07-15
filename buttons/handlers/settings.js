const settingsEmbed = require("../../embeds/settingsEmbed");
const settingsButtons = require("../settingsButtons");

module.exports = async (interaction) => {
  await interaction.update({
    embeds: [settingsEmbed()],
    components: settingsButtons()
  });
};