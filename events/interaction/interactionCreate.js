const buttonRegistry = require("../../buttons/buttonRegistry");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        console.log(`📥 Ejecutando comando: ${interaction.commandName}`);
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`❌ Error en comando ${interaction.commandName}:`, error);
        const response = interaction.replied || interaction.deferred
          ? interaction.followUp
          : interaction.reply;
        await response.call(interaction, { content: "❌ Hubo un error al ejecutar ese comando.", ephemeral: true });
      }
      return;
    }

    if (interaction.isButton()) {
      const handler = buttonRegistry[interaction.customId];
      if (typeof handler === "function") {
        console.log(`📥 Botón pulsado: ${interaction.customId}`);
        try {
          await handler(interaction, client);
        } catch (error) {
          console.error(`❌ Error en botón ${interaction.customId}:`, error);
          const response = interaction.replied || interaction.deferred
            ? interaction.followUp
            : interaction.reply;
          await response.call(interaction, { content: "❌ Hubo un error al procesar ese botón.", ephemeral: true });
        }
      } else {
        console.warn(`⚠️ Botón sin manejador: ${interaction.customId}`);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "⚠️ Botón no reconocido.", ephemeral: true });
        }
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      console.log(`📥 Modal enviado: ${interaction.customId}`);
      if (interaction.customId === "song_search_modal") {
        const song = interaction.fields.getTextInputValue("song_query");
        await client.musicService.play(interaction, song);
      }
    }
  }
};
