<h1 align="center">discmd-handler</h1>
<br/>
<div align="center">
  <a href="https://Juhan280.github.io/discmd-handler/modules">API Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <!-- <a href="https://discord.gg/[discord-invite-code]">Discord</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span> -->
  <a href="https://www.npmjs.com/package/discmd-handler">npm</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/Juhan280/discmd-handler/issues/new">Issues</a>
  <br />
</div>

<br/>
<br/>

> This package has not been tested on Windows and is not currently compatible with Windows operating systems. If you're interested in helping to make it work on Windows, we welcome contributions and pull requests!

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
  - [Requirements](#requirements)
  - [Install](#install)
- [Basic usage](#basic-usage)
- [Other commands](#other-commands)
  - [Message Command](#message-command)
  - [Button Command](#button-command)
  - [Select Menu Command](#select-menu-command)
- [Registering Slash Commands](#registering-slash-commands)
- [Guides and concepts](#guides-and-concepts)
  - [Working with CommonJs or TypeScript](#working-with-commonjs-or-typescript)
  - [Error handling](#error-handling)
- [Changelog](#changelog)

## Introduction

`discmd-handler` is a lightweight and easy-to-use command handler for Discord.js bots. This package is designed to simplify the process of implementing a command handler in your Discord bot by providing a flexible and customizable framework that can handle a wide range of commands.

The package currently contains handlers for the commands that the developer uses. However, if you need support for other types of commands, you can make a feature request or contribute to the development of the package.

With `discmd-handler`, you can easily create and manage commands for your bot without having to write the same boilerplate code every time. The package is designed to be modular and flexible, allowing you to customize it to fit your specific needs.

Whether you're a beginner or an experienced developer, `discmd-handler` can help you save time and streamline your bot development process. Try it out today and see how easy it can be to implement a powerful command handler for your Discord bot!

## Installation

### Requirements

- `discord.js@14`

### Install

```sh
npm i discmd-handler     # npm
yarn add discmd-handler  # yarn
pnpm add discmd-handler  # pnpm
```

## Basic usage

Setup:

```js
import { Client, GatewayIntentBits } from "discord.js";
import { handleCommands } from "discmd-handler";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

handleCommands({
  client,
  // All the paths are relative to process.cwd()
  commands: {
    ButtonCommands: "commands/button",
    ChatInputCommands: "commands/chat-input",
    MessageCommands: "commands/message",
    SelectMenuCommands: "commands/select-menu",
  },
  // prefix can be either a string or an array of strings or a function that return a string or array of strings
  // When using a function, the first param will be the `Message` instance.
  prefix: "!",
});

client.login();
```

Inside `commands/chat-input/ping.js`:

```js
import { SlashCommandBuilder } from "discord.js";

/** @type {import("discmd-handler").ChatInputCommandInterface} */
export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
  execute(interaction) {
    interaction.reply("Pong!");
  },
};
```

We use jsdoc `@type` tag to get autocompletion.

## Other commands

### Message Command

```js
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

/** @type {import("discmd-handler").MessageCommandInterface} */
export default {
  name: "components",
  description: "Sends a message with a button and a select menu",
  execute(data) {
    const button = new ButtonBuilder()
      .setCustomId("button#" + data.author.id) // Anything after # is considerd metadata for the command
      .setLabel("This is a button")
      .setStyle(ButtonStyle.Primary);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("selectMenu#" + data.author.id) // Anything after # is considerd metadata for the command
      .addOptions(
        { label: "Option 1", value: "opt1" },
        { label: "Option 2", value: "opt2" }
      );

    const buttonActionRow = new ActionRowBuilder().addComponents(button);
    const selectMenuActionRow = new ActionRowBuilder().addComponents(
      selectMenu
    );

    return data.channel.send({
      components: [buttonActionRow, selectMenuActionRow],
    });
  },
};
```

### Button Command

```js
/** @type {import("discmd-handler").ButtonCommandInterface} */
export default {
  // name should be the part of the customId before #
  // if there is no #, it should be the full customId
  name: "button",
  execute(interaction, metadata) {
    // metadata contains the text after the first # in the customId
    // In this case, its the id of the user who ran the !components command
    if (interaction.user.id !== metadata)
      return interaction.reply({
        content: "You cannot click that button",
        ephemeral: true,
      });

    return interaction.reply(`${interaction.user} clicked the button`);
  },
};
```

### Select Menu Command

```js
/** @type {import("discmd-handler").SelectMenuCommandInterface} */
export default {
  // name should be the part of the customId before #
  // if there is no #, it should be the full customId
  name: "selectMenu",
  execute(interaction, metadata) {
    // metadata contains the text after the first # in the customId
    // In this case, its the id of the user who ran the !components command
    if (interaction.user.id !== metadata)
      return interaction.reply({
        content: "You cannot use this select menu",
        ephemeral: true,
      });

    return interaction.reply(
      `${interaction.user} choose ${interaction.values[0]}`
    );
  },
};
```

## Registering Slash Commands

This code should be in a seperate file. You should only run it when you want to register slash commands.

```js
import { registerApplicationCommands } from "discmd-handler";

registerApplicationCommands({
  token: process.env.DISCORD_TOKEN!,
  commands: {
    ChatInputCommands: "commands/chat-input",
  },
  // Omit this option if you want to register global commands
  guildId: "guild id of the dev server",
});
```

## Guides and concepts

### Working with CommonJs or TypeScript

All the examples above are given in [ESModule](https://nodejs.org/api/esm.html#modules-ecmascript-modules). However, this package also supports [CommonJs](https://nodejs.org/docs/latest/api/modules.html#modules-commonjs-modules) and [TypeScript](https://www.typescriptlang.org).

#### CommonJs

```js
const { SlashCommandBuilder } = require("discord.js");

/** @type {import("discmd-handler").ChatInputCommandInterface} */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
  execute(interaction) {
    interaction.reply("Pong!");
  },
};
```

<br>

#### TypeScript

```ts
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInterface } from "discmd-handler";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
  execute(interaction) {
    interaction.reply("Pong!");
  },
} satisfies ChatInputCommandInterface;
```

The `satisfies` keyword in typescript is introduced in version `4.9`. If you are using older version, your code should look like this instead.

```ts
const command: ChatInputCommandInterface = {
	data: ...,
	execute(interaction) {
		....
	},
}
export default command;
```

### Error handling

Currently, error handling is not customizable. If an error occurs while running the `execute` function, the default behavior is to log it to the console. However, we recognize the importance of providing users with the ability to customize error handling to better suit their needs. As such, we are actively working on a solution and plan to make it available in future versions.

## Changelog

View the changelog at [CHANGELOG.md](https://github.com/Juhan280/discmd-handler/blob/HEAD/CHANGELOG.md)
