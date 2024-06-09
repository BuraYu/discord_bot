const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("List all commands or info about a specific command.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to get info about")
        .setRequired(false)
    ),
  async execute(interaction) {
    const commandName = interaction.options.getString("command");
    const { commands } = interaction.client;

    if (!commandName) {
      const commandList = commands
        .map((command) => command.data.name)
        .join(", ");
      return interaction.reply(`Here are all my commands: ${commandList}`);
    }

    const command = commands.get(commandName);

    if (!command) {
      return interaction.reply(`That's not a valid command!`);
    }

    return interaction.reply(
      `**Name:** ${command.data.name}\n**Description:** ${command.data.description}`
    );
  },
};
