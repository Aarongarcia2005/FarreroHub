const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior
} = require("@discordjs/voice");

class MusicManager {

    constructor() {

        this.connection = null;

        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        });

        this.queue = [];

        this.current = null;

        this.player.on(AudioPlayerStatus.Idle, () => {
            this.playNext();
        });

    }

    connect(channel) {

        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        this.connection.subscribe(this.player);

    }

    play(resource) {

        this.player.play(resource);

    }

    playNext() {

        if (this.queue.length === 0) {

            this.current = null;
            return;

        }

        const next = this.queue.shift();

        this.current = next;

        this.player.play(next.resource);

    }

}

module.exports = new MusicManager();