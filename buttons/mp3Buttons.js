const fs = require("fs");
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function mp3Buttons() {
  const audiosDir = path.join(__dirname, "..", "audios");
  const files = fs.existsSync(audiosDir)
    ? fs.readdirSync(audiosDir).filter((file) => file.endsWith(".mp3")).slice(0, 5)
    : [];

  const buttons = files.map((file) =>
    new ButtonBuilder()
      .setCustomId(`mp3:${file}`)
      .setLabel(`🎵 ${file}`)
      .setStyle(ButtonStyle.Primary)
  );

  buttons.push(
    new ButtonBuilder()
      .setCustomId("back_home")
      .setLabel("🏠 Inicio")
      .setStyle(ButtonStyle.Secondary)
  );

  return [new ActionRowBuilder().addComponents(buttons)];
}

module.exports = mp3Buttons;
