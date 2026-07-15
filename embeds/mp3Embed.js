const { EmbedBuilder } = require("discord.js");
const config = require("../config/config");

function mp3Embed(files = []) {
  return new EmbedBuilder()
    .setColor(config.colors.secondary)
    .setTitle("📂 Panel MP3")
    .setDescription("Selecciona un sonido del directorio de audios.")
    .addFields(
      files.length > 0
        ? { name: "Archivos disponibles", value: files.map((file) => `• ${file}`).join("\n") }
        : { name: "Estado", value: "No hay archivos MP3 disponibles en la carpeta audios." }
    )
    .setFooter({ text: "Farrero Hub • MP3" });
}

module.exports = mp3Embed;
