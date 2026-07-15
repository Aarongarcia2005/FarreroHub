const { DisTube } = require("distube");
const ffmpegPath = require("ffmpeg-static");
const { YtDlpPlugin } = require("./plugins/ytDlpPlugin");

let distube;

function init(client) {
    distube = new DisTube(client, {
        emitNewSongOnly: true,
        savePreviousSongs: true,
        plugins: [new YtDlpPlugin()],
        ffmpeg: { path: ffmpegPath }
    });

    distube.on("error", (channel, error) => {
        console.error("🎵 DisTube error:", error);
        if (channel?.isTextBased?.()) {
            channel.send("❌ Ha ocurrido un error en el reproductor de música.").catch(() => null);
        }
    });

    distube.on("playSong", (queue, song) => {
        console.log(`🎶 Reproduciendo ${song.name} en texto: ${queue.textChannel?.name || "canal"}, voz: ${queue.voiceChannel?.name || "desconocido"}`);
    });

    distube.on("addSong", (queue, song) => {
        console.log(`➕ Añadida a la cola: ${song.name} - canal de voz: ${queue.voiceChannel?.name || "desconocido"}`);
    });

    distube.on("empty", (queue) => {
        console.log(`🚪 El canal de voz ${queue.voiceChannel?.name || "desconocido"} está vacío.`);
    });

    distube.on("disconnect", (queue) => {
        console.log(`❌ Se desconectó del canal de voz ${queue.voiceChannel?.name || "desconocido"}.`);
    });

    distube.on("finish", (queue) => {
        console.log("🎵 Cola finalizada.");
    });

    distube.on("debug", (message) => {
        console.debug("🧪 DisTube debug:", message);
    });

    return distube;
}

function get() {
    return distube;
}

module.exports = {
    init,
    get
};