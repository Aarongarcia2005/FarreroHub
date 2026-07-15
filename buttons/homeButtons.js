const {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js");

function homeButtons(){

return [

new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("music")
.setLabel("🎵 Música")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("mp3")
.setLabel("📂 MP3")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("partido")
.setLabel("⚽ Partido")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("settings")
.setLabel("⚙️ Ajustes")
.setStyle(ButtonStyle.Danger)

)

];

}

module.exports = homeButtons;