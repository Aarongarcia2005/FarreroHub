const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function matchButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("himno").setLabel("🎶 Himno").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("himno_entero").setLabel("🎵 Himno entero").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("lavida").setLabel("🏴‍☠️ La vida pirata").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("gol").setLabel("⚽ Gol").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("celebracion").setLabel("🎉 Celebración").setStyle(ButtonStyle.Secondary)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("stop").setLabel("🛑 Stop").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("back_home").setLabel("🏠 Inicio").setStyle(ButtonStyle.Secondary)
    )
  ];
}

module.exports = matchButtons;
