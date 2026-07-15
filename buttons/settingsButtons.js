const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function settingsButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("settings").setLabel("⚙️ Configuración").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("notifications").setLabel("🔔 Notificaciones").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("back_home").setLabel("🏠 Inicio").setStyle(ButtonStyle.Success)
    )
  ];
}

module.exports = settingsButtons;
