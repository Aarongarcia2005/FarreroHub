const partyEmbed = require("../../embeds/partyEmbed");
const matchButtons = require("../matchButtons");

module.exports = async (interaction) => {
  await interaction.update({
    embeds: [partyEmbed()],
    components: matchButtons()
  });
};