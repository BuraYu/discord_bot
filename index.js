require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const { OpenAI } = require("openai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");

let commandFolders = [];
try {
  commandFolders = fs.readdirSync(foldersPath);
} catch (err) {
  console.error(`Error reading command folders: ${err}`);
}

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  let commandFiles = [];
  try {
    commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
  } catch (err) {
    console.error(`Error reading command files in folder ${folder}: ${err}`);
  }

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  const { cooldowns } = interaction.client;

  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name);
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000);
      return interaction.reply({
        content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
        ephemeral: true,
      });
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

const IGNORE_PREFIX1 = "!";
const IGNORE_PREFIX2 = "/";
const CHANNELS = ["1247520729373741089"];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const userCooldowns = new Map();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(IGNORE_PREFIX1)) return;
  if (message.content.startsWith(IGNORE_PREFIX2)) return;
  if (
    !CHANNELS.includes(message.channelId) &&
    !message.mentions.has(client.user.id)
  )
    return;

  const now = Date.now();
  const cooldownAmount = 20 * 1000; // 20 seconds in milliseconds
  const lastMessageTimestamp = userCooldowns.get(message.author.id);

  if (lastMessageTimestamp && now - lastMessageTimestamp < cooldownAmount) {
    const timeLeft = (
      (lastMessageTimestamp + cooldownAmount - now) /
      1000
    ).toFixed(1);
    message.reply(
      `Please wait ${timeLeft} more seconds before sending another message.`
    );
    return;
  }

  userCooldowns.set(message.author.id, now);

  const sendInterval = setInterval(() => {
    message.channel.sendTyping();
  }, 5000);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "",
        },
        {
          role: "user",
          content: message.content,
        },
      ],
    });

    clearInterval(sendInterval);

    if (!response) {
      message.reply("OpenAI API is not working. Try again in a moment");
      return;
    }
    message.reply(response.choices[0].message.content);
  } catch (error) {
    clearInterval(sendInterval);
    console.error("OpenAI Error: \n", error);
    message.reply(
      "There was an error while processing your request. Please try again later."
    );
  }
});

client.login(token);
