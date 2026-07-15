const fs = require("fs");
const path = require("path");
const mp3Embed = require("../../embeds/mp3Embed");
const mp3Buttons = require("../mp3Buttons");

module.exports = async (interaction) => {
  const audiosDir = path.join(__dirname, "..", "..", "audios");
  const files = fs.existsSync(audiosDir)
    ? fs.readdirSync(audiosDir).filter((file) => file.endsWith(".mp3"))
    : [];

  await interaction.update({
    embeds: [mp3Embed(files)],
    components: mp3Buttons()
  });
};