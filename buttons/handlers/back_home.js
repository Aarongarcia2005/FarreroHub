const homeEmbed = require("../../embeds/homeEmbed");
const homeButtons = require("../homeButtons");

module.exports = async (interaction) => {

    await interaction.update({
        embeds: [homeEmbed()],
        components: homeButtons()
    });

};