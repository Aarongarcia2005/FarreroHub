const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Reproduce una canción")
        .addStringOption((option) =>
            option
                .setName("cancion")
                .setDescription("Nombre o enlace de YouTube")
                .setRequired(true)
        ),

    async execute(interaction) {
        const song = interaction.options.getString("cancion");
        await interaction.client.musicService.play(interaction, song);
    }
};