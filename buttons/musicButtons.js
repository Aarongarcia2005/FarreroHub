const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

function musicButtons() {

    return [

        new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId("play")
                .setLabel("▶️ Play")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("pause")
                .setLabel("⏸️ Pause")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("skip")
                .setLabel("⏭️ Skip")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("stop")
                .setLabel("⏹️ Stop")
                .setStyle(ButtonStyle.Danger)

        ),

        new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId("queue")
                .setLabel("📜 Cola")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("volume")
                .setLabel("🔊 +")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("volume_down")
                .setLabel("🔉 -")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("back_home")
                .setLabel("🏠 Inicio")
                .setStyle(ButtonStyle.Primary)

        ),


        new ActionRowBuilder().addComponents(

    new ButtonBuilder()
        .setCustomId("search")
        .setLabel("🔍 Buscar")
        .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
        .setCustomId("youtube")
        .setLabel("📺 YouTube")
        .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
        .setCustomId("mp3_panel")
        .setLabel("📂 MP3")
        .setStyle(ButtonStyle.Primary)

)

    ];

}

module.exports = musicButtons;