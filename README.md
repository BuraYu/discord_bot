# Discord Bot

This repository contains the setup for a Discord bot using Node.js, Discord.js, ESLint, dotenv, and OpenAI.

## Setup

Follow the steps below to initialize the project and install the necessary dependencies.

### Step 1: Initialize the project

Run the following command to create a `package.json` file with default values:

```sh
npm init -y
```

### Step 2: Install Discord.js

Run the following command to install the discord.js library:

```sh
npm install discord.js
```

### Step 3: Install ESLint

Run the following command to install ESLint as a development dependency:

```sh
npm install --save-dev eslint
```

### Step 4: Install dotenv

Run the following command to install dotenv as a development dependency:

```sh
npm install dotenv
```

### Step 5: Install openai

Run the following command to install OpenAI as a development dependency:

```sh
npm install openai
```

### Step 6: Configure Environment Variables

1. Create config.json:

Create a config.json file in the main folder and add the following object with your Discord bot token, client ID, and guild ID:

```sh
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "clientId": "YOUR_DISCORD_CLIENT_ID",
  "guildId": "YOUR_DISCORD_GUILD_ID"
}
```

2. Create .env File:

Create a .env file in the main folder and add your OpenAI API key as follows:

```sh
OPENAI_KEY=YOUR_OPENAI_API_KEY
```

### Step 7: Run deploy-commands.js

Loads the commands into the bot

Run the following command in the terminal:

```sh
node deploy-commands.js
```

### Step 7: Run the index.js (server):

Start the server by running the following command:

```sh
node index.js
```
