/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
	entryPoints: ["./src/index.ts"],
	lightHighlightTheme: "solarized-light",
	darkHighlightTheme: "one-dark-pro",
	kindSortOrder: [
		"Constructor",
		"Property",
		"Function",
		"Class",
		"Interface",
		"Enum",
	],
	externalSymbolLinkMappings: {
		typescript: {
			Omit: "https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys",
			Promise:
				"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
			Record:
				"https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type",
		},
		"discord.js": {
			ButtonInteraction:
				"https://discord.js.org/#/docs/discord.js/main/class/ButtonInteraction",
			ChatInputCommandInteraction:
				"https://discord.js.org/#/docs/discord.js/main/class/ChatInputCommandInteraction",
			Client: "https://discord.js.org/#/docs/discord.js/main/class/Client",
			Guild: "https://discord.js.org/#/docs/discord.js/main/class/Guild",
			GuildMember:
				"https://discord.js.org/#/docs/discord.js/main/class/GuildMember",
			GuildTextBasedChannel:
				"https://discord.js.org/#/docs/discord.js/main/typedef/GuildTextBasedChannel",
			Message: "https://discord.js.org/#/docs/discord.js/main/class/Message",
			TextBasedChannel:
				"https://discord.js.org/#/docs/discord.js/main/typedef/TextBasedChannels",
			User: "https://discord.js.org/#/docs/discord.js/main/class/User",
		},
		"@discordjs/builders": {
			SlashCommandBuilder:
				"https://discord.js.org/#/docs/builders/main/class/SlashCommandBuilder",
			SlashCommandSubcommandsOnlyBuilder:
				"https://discord.js.org/#/docs/builders/main/typedef/SlashCommandSubcommandsOnlyBuilder",
		},
		"@discordjs/collection": {
			Collection:
				"https://discord.js.org/#/docs/collection/main/class/Collection",
		},
	},
};
