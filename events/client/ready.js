const { ActivityType, Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.clear();
    console.log("==================================");
    console.log("🩷 FARRERO HUB");
    console.log("==================================");
    console.log(`✅ Bot conectado: ${client.user.tag}`);
    console.log(`📦 Comandos cargados: ${client.commands.size}`);
    console.log(`🎛️ Botones cargados: ${client.buttons.size}`);
    console.log(`🎵 Sistema música OK`);
    console.log(`📂 Sistema MP3 OK`);
    console.log("==================================");

    try {
      await client.user.setPresence({
        activities: [{ name: "🩷 Farrero FC 💙", type: ActivityType.Playing }],
        status: "online"
      });
    } catch (error) {
      console.warn("⚠️ No se pudo actualizar la presencia del bot:", error.message);
    }
  }
};
