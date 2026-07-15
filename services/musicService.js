const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const yts = require("yt-search");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType
} = require("@discordjs/voice");

class MusicService {
  constructor(client) {
    this.client = client;
    this.distube = client.distube;
    this.localPlayers = new Map();
  }

  resolveLocalAudio(query) {
    const audiosDir = path.join(__dirname, "..", "audios");
    const candidates = [
      query,
      `${query}.mp3`,
      path.basename(query),
      `${path.basename(query, path.extname(query))}.mp3`
    ];

    for (const candidate of candidates) {
      const resolved = path.resolve(audiosDir, candidate);
      if (fs.existsSync(resolved) && resolved.startsWith(audiosDir)) {
        return resolved;
      }
    }

    return null;
  }

  isYouTubeURL(input) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(input);
  }

  async searchYouTube(query) {
    const result = await yts(query);
    const video = result?.videos?.[0];
    return video?.url || null;
  }

  async play(interaction, query) {
    if (!query || !query.trim()) {
      return interaction.reply({ content: "⚠️ Escribe una canción o un enlace válido.", ephemeral: true });
    }

    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: "⚠️ Debes estar en un canal de voz para reproducir música.", ephemeral: true });
    }

    const songQuery = query.trim();
    const voiceChannel = interaction.member.voice.channel;

    const botPermissions = voiceChannel.permissionsFor(interaction.guild.members.me);
    if (!botPermissions?.has("Connect") || !botPermissions?.has("Speak")) {
      return interaction.reply({ content: "❌ No tengo permiso para unirme o hablar en tu canal de voz.", ephemeral: true });
    }

    console.log(`🎧 Intentando reproducir en canal de voz: ${voiceChannel.name} (${voiceChannel.id})`);

    try {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
      }

      const localAudio = this.resolveLocalAudio(songQuery);
      if (localAudio) {
        return this.playLocal(interaction, localAudio, songQuery);
      }

      let source = songQuery;
      if (this.isYouTubeURL(songQuery)) {
        source = songQuery;
      } else {
        source = await this.searchYouTube(songQuery);
        if (!source) {
          throw new Error("NO_YOUTUBE_RESULT");
        }
      }

      await this.distube.play(voiceChannel, source, {
        member: interaction.member,
        textChannel: interaction.channel,
        skipIfPlaying: false
      });

      await interaction.editReply({ content: `🎵 Se está reproduciendo: ${songQuery}` });
    } catch (error) {
      console.error("Error al reproducir música:", error);
      const message = error.message === "NO_YOUTUBE_RESULT"
        ? `❌ No se encontró ningún resultado para "${songQuery}".`
        : `❌ No pude reproducir "${songQuery}". Comprueba el nombre, usa una URL válida o un archivo MP3 dentro de audios.`;
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: message });
      } else {
        await interaction.reply({ content: message, ephemeral: true });
      }
    }
  }

  async playLocal(interaction, filePath, songQuery) {
    const voiceChannel = interaction.member.voice.channel;
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause
      }
    });

    const resource = createAudioResource(fs.createReadStream(filePath), {
      inputType: StreamType.Arbitrary,
      inlineVolume: true
    });

    resource.volume.setVolume(0.25);

    player.play(resource);
    connection.subscribe(player);
    this.localPlayers.set(interaction.guildId, { connection, player });

    player.on(AudioPlayerStatus.Idle, () => {
      console.log(`Local audio finished in guild ${interaction.guildId}, keeping the voice connection open.`);
      // Do not destroy the connection here so the bot stays in the channel after the audio ends.
    });

    player.on("error", (error) => {
      console.error("Error en reproducción local:", error);
      try {
        connection.destroy();
      } catch (destroyError) {
        console.error("Error al destruir conexión local tras error:", destroyError);
      }
      this.localPlayers.delete(interaction.guildId);
    });

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: `🎵 Reproduciendo local: ${songQuery}` });
    } else {
      await interaction.reply({ content: `🎵 Reproduciendo local: ${songQuery}`, ephemeral: true });
    }
  }

  async pause(interaction) {
    const queue = this.distube.getQueue(interaction.guildId);
    if (!queue) {
      return interaction.reply({ content: "⚠️ No hay ninguna canción reproduciéndose.", ephemeral: true });
    }

    if (queue.paused) {
      return interaction.reply({ content: "⚠️ La reproducción ya está en pausa.", ephemeral: true });
    }

    this.distube.pause(interaction.guildId);
    return interaction.reply({ content: "⏸️ Reproducción pausada.", ephemeral: true });
  }

  async resume(interaction) {
    const queue = this.distube.getQueue(interaction.guildId);
    if (!queue) {
      return interaction.reply({ content: "⚠️ No hay ninguna canción para continuar.", ephemeral: true });
    }

    if (!queue.paused) {
      return interaction.reply({ content: "⚠️ La reproducción ya está activa.", ephemeral: true });
    }

    this.distube.resume(interaction.guildId);
    return interaction.reply({ content: "▶️ Reproducción reanudada.", ephemeral: true });
  }

  async stop(interaction) {
    const guildId = interaction.guildId;
    const local = this.localPlayers.get(guildId);
    if (local) {
      try {
        local.player.stop(true);
      } catch (error) {
        console.error("Error al detener reproducción local:", error);
      }
      try {
        local.connection.destroy();
      } catch (error) {
        console.error("Error al destruir conexión local:", error);
      }
      this.localPlayers.delete(guildId);
      return interaction.reply({ content: "⏹️ Reproducción local detenida.", ephemeral: true });
    }

    const queue = this.distube.getQueue(guildId);
    if (!queue) {
      return interaction.reply({ content: "⚠️ No hay ninguna canción reproduciéndose.", ephemeral: true });
    }

    this.distube.stop(guildId);
    return interaction.reply({ content: "⏹️ Reproducción detenida.", ephemeral: true });
  }

  async skip(interaction) {
    const queue = this.distube.getQueue(interaction.guildId);
    if (!queue) {
      return interaction.reply({ content: "⚠️ No hay ninguna canción en la cola.", ephemeral: true });
    }

    this.distube.skip(interaction.guildId);
    return interaction.reply({ content: "⏭️ Canción saltada.", ephemeral: true });
  }

  async adjustVolume(interaction, delta) {
    const queue = this.distube.getQueue(interaction.guildId);
    if (!queue) {
      return interaction.reply({ content: "⚠️ No hay ninguna canción reproduciéndose.", ephemeral: true });
    }

    const currentVolume = Number(queue.volume) || 0;
    const safeVolume = Math.max(0, Math.min(100, currentVolume + delta));
    this.distube.setVolume(interaction.guildId, safeVolume);

    const action = delta > 0 ? "subido" : "bajado";
    return interaction.reply({ content: `🔊 Volumen ${action} a ${safeVolume}%`, ephemeral: true });
  }

  async setVolume(interaction, volume) {
    const queue = this.distube.getQueue(interaction.guildId);
    if (!queue) {
      return interaction.reply({ content: "⚠️ No hay ninguna canción reproduciéndose.", ephemeral: true });
    }

    const safeVolume = Math.max(0, Math.min(100, Number(volume) || 0));
    this.distube.setVolume(interaction.guildId, safeVolume);
    return interaction.reply({ content: `🔊 Volumen ajustado a ${safeVolume}%`, ephemeral: true });
  }

  getQueue(interaction) {
    return this.distube.getQueue(interaction.guildId);
  }
}

module.exports = MusicService;
