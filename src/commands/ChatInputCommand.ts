import {
	ChatInputCommandInteraction,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { getCategory } from "../utils";
import { Command, CommandInterface } from "./BaseCommand";

/** Represents the structure of a chat input command. */
export interface ChatInputCommandInterface extends CommandInterface {
	/** The slash command data of this command. */
	data:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

	/**
	 * The function to run when the command is triggered.
	 *
	 * @param interaction The interaction that triggered the command.
	 */
	execute: (interaction: ChatInputCommandInteraction) => unknown;
}

/** Represents a chat input command. */
export class ChatInputCommand extends Command {
	/** The unique id of the command. */
	id: string;

	/** The name of the command. */
	name: string;

	/** The description of the command. */
	description: string;

	/** The slash command data of this command. */
	data: RESTPostAPIChatInputApplicationCommandsJSONBody;

	/** Whether the command is disabled or not. */
	disabled: boolean;

	/** Additional metadata associated with the command. */
	metadata: unknown;

	/** The category the command belongs to. */
	category: string;

	/**
	 * The function to run when the command is triggered.
	 *
	 * @param interaction The interaction that triggered the command.
	 */
	execute: (interaction: ChatInputCommandInteraction) => unknown;

	/**
	 * Creates a new instance of `ChatInputCommand`.
	 *
	 * @param cmd The chat input command interface.
	 * @param path The path of the file where this command is located.
	 * @param id The unique id of the command.
	 */
	constructor(cmd: ChatInputCommandInterface, path: string, id: string) {
		super(path);

		this.id = id;
		this.name = cmd.data.name;
		this.description = cmd.data.description;
		this.data = cmd.data.toJSON();
		this.disabled = !!cmd.disabled;
		this.metadata = cmd.metadata;
		this.category = getCategory(path, cmd.category);
		this.execute = cmd.execute;
	}
}
