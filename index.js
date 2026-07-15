require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, ActivityType } = require("discord.js");
const { token } = require("./config/config");
const distubeService = require("./services/distube");
const MusicService = require("./services/musicService");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
client.buttons = new Collection();

function loadCommands(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            loadCommands(fullPath);
            continue;
        }

        if (!entry.isFile() || !entry.name.endsWith(".js")) continue;

        const command = require(fullPath);

        if (command?.data?.name && typeof command.execute === "function") {
            client.commands.set(command.data.name, command);
            console.log(`✅ Comando cargado: ${command.data.name}`);
        }
    }
}

function loadEvents(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            loadEvents(fullPath);
            continue;
        }

        if (!entry.isFile() || !entry.name.endsWith(".js")) continue;

        const event = require(fullPath);

        if (!event?.name || typeof event.execute !== "function") continue;

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

loadCommands(path.join(__dirname, "commands"));
loadEvents(path.join(__dirname, "events"));

const buttonRegistry = require("./buttons/buttonRegistry");
Object.entries(buttonRegistry).forEach(([id, handler]) => client.buttons.set(id, handler));

client.distube = distubeService.init(client);
client.musicService = new MusicService(client);

client.login(token).catch((error) => {
    console.error("❌ No se pudo iniciar el bot.", error);
});