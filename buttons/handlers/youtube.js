const musicEmbed = require("../../embeds/musicEmbed");
const musicButtons = require("../musicButtons");

module.exports = async (interaction) => {
  await interaction.update({
    embeds: [musicEmbed("📺 YouTube")],
    components: musicButtons()
  });
};