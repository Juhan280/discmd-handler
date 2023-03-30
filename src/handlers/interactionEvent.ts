import { Client, Collection, Events } from "discord.js";
import { ButtonCommand } from "../commands/ButtonCommand";
import { ChatInputCommand } from "../commands/ChatInputCommand";
import { SelectMenuCommand } from "../commands/SelectMenuCommand";

interface InteractionEventCommands {
	ButtonCommands: Collection<string, ButtonCommand>;
	ChatInputCommands: Collection<string, ChatInputCommand>;
	SelectMenuCommands: Collection<string, SelectMenuCommand>;
}

export default function handleInteractionCreateEvent(
	client: Client,
	commands: InteractionEventCommands
) {
	client.on(Events.InteractionCreate, async interaction => {
		if (interaction.isButton()) {
			const [name, ...rest] = interaction.customId.split("#");
			const command = commands.ButtonCommands.find(
				c => !c.disabled && c.name === name
			);
			if (!command) return;

			Promise.resolve()
				.then(() => command.execute(interaction, rest.join("#") || null))
				.catch(console.log);
		}

		if (interaction.isChatInputCommand()) {
			const command = commands.ChatInputCommands.find(
				c => !c.disabled && c.name === interaction.commandName
			);
			if (!command) return;

			Promise.resolve()
				.then(() => command.execute(interaction))
				.catch(console.log);
		}

		if (interaction.isAnySelectMenu()) {
			const [name, ...rest] = interaction.customId.split("#");
			const command = commands.SelectMenuCommands.find(
				c => !c.disabled && c.name === name
			);
			if (!command) return;

			Promise.resolve()
				.then(() => command.execute(interaction, rest.join("#") || null))
				.catch(console.log);
		}
	});
}
