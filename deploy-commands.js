// Load local .env only during development so production (Railway) reads env vars.
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config(); // dev-only
}

const fs = require("fs");
const path = require("path");

const { REST, Routes } = require("discord.js");

const commands = [];

const commandFolders = fs.readdirSync(path.join(__dirname, "commands"));

for (const folder of commandFolders) {

    const commandFiles = fs
        .readdirSync(path.join(__dirname, "commands", folder))
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {

        const command = require(`./commands/${folder}/${file}`);

        if (command.data) {
            commands.push(command.data.toJSON());
        }

    }

}

// Validate required environment variables before attempting to register commands.
if (!process.env.TOKEN) {
    console.error("TOKEN no encontrado. Define TOKEN en las variables de entorno.");
    process.exit(1);
}
if (!process.env.CLIENT_ID) {
    console.error("CLIENT_ID no encontrado. Define CLIENT_ID en las variables de entorno.");
    process.exit(1);
}
if (!process.env.GUILD_ID) {
    console.error("GUILD_ID no encontrado. Define GUILD_ID en las variables de entorno.");
    process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {

    try {

        console.log(`🚀 Registrando ${commands.length} comandos...`);

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log("✅ Comandos registrados correctamente.");

    } catch (error) {

        console.error(error);

    }

})();