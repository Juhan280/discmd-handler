import { Awaitable, Client, Collection, Message } from "discord.js";
import { ButtonCommand } from "./commands/ButtonCommand";
import { ChatInputCommand } from "./commands/ChatInputCommand";
import { MessageCommand } from "./commands/MessageCommand";
import loadCommands from "./commandloader";
import { LogLevel } from "./enums";
import handleInteractionCreateEvent from "./handlers/interactionEvent";
import handleMessageCreateEvent from "./handlers/messageEvent";
import {
	anyComponentCommandSchema,
	chatInputCommandSchema,
	handlerOptionSchema,
	messageCommandSchema,
} from "./zodSchemas";
import { getPath } from "./utils";
import { SelectMenuCommand } from "./commands/SelectMenuCommand";

/** Options for configuring a command handler. */
export interface CommandHandlerOptions {
	/** The Discord.js client instance. */
	client: Client;

	/**
	 * An object mapping command types to their respective directory names.
	 *
	 * @remarks
	 * Each command type should be mapped to a directory name containing the
	 * files and logic for handling that command type.
	 *
	 * The paths specified here should be relative to current working directory (`process.cwd()`)
	 *
	 * If any of the command types are not provided, the corresponding type of
	 * command will not be handled by the handler.
	 */
	commands: {
		/** The directory name for {@link ButtonCommand} type commands. */
		ButtonCommands?: string;

		/** The directory name for {@link ChatInputCommand} type commands. */
		ChatInputCommands?: string;

		/** The directory name for {@link MessageCommand} type commands. */
		MessageCommands?: string;

		/** The directory name for {@link SelectMenuCommand} type commands. */
		SelectMenuCommands?: string;
	};

	/**
	 * The prefix or array of prefixes for the {@link MessageCommand} type commands.
	 * This can also be a function that returns the prefix(es) based on the message.
	 * This property is required if the `MessageCommands` property is present.
	 */
	prefix?:
		| string
		| string[]
		| ((message: Message) => Awaitable<string | string[]>);

	/**
	 * The log level to use.
	 * @defaultValue {@link LogLevel.ERROR | LogLevel.ERROR}
	 */
	logLevel?: LogLevel;
}

/**
 * Handles Discord commands for a Discord.js client.
 *
 * @param options - The options for configuring the handler.
 * @returns An object containing the loaded commands and any errors.
 *
 *
 * @example
 * ```ts
 * import { Client, GatewayIntentBits } from "discord.js";
 * import { handleCommands } from "discmd-handler";
 *
 * const client = new Client({
 *   intents: [
 *     GatewayIntentBits.Guilds,
 *     GatewayIntentBits.GuildMessages,
 *     GatewayIntentBits.MessageContent,
 *   ]
 * });
 *
 * handleCommands({
 *   client,
 *   commands: {
 *     ButtonCommands: "commands/button",
 *     ChatInputCommands: "commands/chat-input",
 *     MessageCommands: "commands/message",
 *     SelectMenuCommands: "commands/select-menu",
 *   },
 *   prefix: "!",
 * });
 *
 * client.login();
 * ```
 */
export async function handleCommands(options: CommandHandlerOptions) {
	handlerOptionSchema.parse(options);

	const logLevel = options.logLevel ?? LogLevel.ERROR;

	const commands = {
		ButtonCommands: new Collection<string, ButtonCommand>(),
		ChatInputCommands: new Collection<string, ChatInputCommand>(),
		MessageCommands: new Collection<string, MessageCommand>(),
		SelectMenuCommands: new Collection<string, SelectMenuCommand>(),
	} satisfies Record<
		keyof CommandHandlerOptions["commands"],
		Collection<string, unknown>
	>;

	const errors = {} as Record<keyof typeof commands, unknown[]>;

	if (options.commands.ButtonCommands) {
		const [cmds, errs] = await loadCommands(
			getPath(process.cwd(), options.commands.ButtonCommands),
			ButtonCommand,
			anyComponentCommandSchema,
			logLevel
		);

		commands.ButtonCommands = cmds;
		errors.ButtonCommands = errs;
	}

	if (options.commands.ChatInputCommands) {
		const [cmds, errs] = await loadCommands(
			getPath(process.cwd(), options.commands.ChatInputCommands),
			ChatInputCommand,
			chatInputCommandSchema,
			logLevel
		);

		commands.ChatInputCommands = cmds;
		errors.ChatInputCommands = errs;
	}

	if (options.commands.SelectMenuCommands) {
		const [cmds, errs] = await loadCommands(
			getPath(process.cwd(), options.commands.SelectMenuCommands),
			SelectMenuCommand,
			anyComponentCommandSchema,
			logLevel
		);

		commands.SelectMenuCommands = cmds;
		errors.SelectMenuCommands = errs;
	}

	if (options.commands.MessageCommands) {
		if (!options.prefix)
			throw new Error(
				"prefix is required when commands.MessageCommands is provided"
			);

		const [cmds, errs] = await loadCommands(
			getPath(process.cwd(), options.commands.MessageCommands),
			MessageCommand,
			messageCommandSchema,
			logLevel
		);

		handleMessageCreateEvent(options.client, cmds, options.prefix);

		commands.MessageCommands = cmds;
		errors.MessageCommands = errs;
	}

	if (
		Object.entries(options.commands).some(
			c => c[1] && c[0] !== "MessageCommands"
		)
	)
		handleInteractionCreateEvent(options.client, commands);

	if (logLevel >= LogLevel.TABLE) {
		const table = {} as Record<
			keyof typeof commands,
			{ Loaded: number; Errors: number }
		>;

		for (const type in commands) {
			if (!options.commands[type as keyof typeof commands]) continue;

			table[type as keyof typeof commands] = {
				Loaded: commands[type as keyof typeof commands].size,
				Errors: errors[type as keyof typeof commands].length,
			};
		}

		console.table(table);
	}

	return { commands, errors };
}

export { version } from "../package.json";
export * from "./commands/ButtonCommand";
export * from "./commands/ChatInputCommand";
export * from "./commands/MessageCommand";
export * from "./commands/SelectMenuCommand";
export * from "./registerApplicationCommands";
export { LogLevel };
