import {
	Client,
	Guild,
	GuildMember,
	GuildTextBasedChannel,
	If,
	Message,
	TextBasedChannel,
	User,
} from "discord.js";
import { getAliases, getUsage } from "../utils";
import { Command, CommandInterface } from "./BaseCommand";

/** Represents the data available for a message command. */
export interface MessageCommandData<InGuild extends boolean = boolean> {
	/** The client that received the command. */
	client: Client<true>;

	/** The message containing the command. */
	message: Message<InGuild>;

	/** The channel the message was sent from. */
	channel: If<InGuild, GuildTextBasedChannel, TextBasedChannel>;

	/** The guild the message was sent from. */
	guild: If<InGuild, Guild>;

	/** The user that sent the message. */
	author: User;

	/** The member object of the user that sent the message. */
	member: If<InGuild, GuildMember>;

	/** An array containing the arguments of the command. */
	args: string[];

	/** Returns true if the command was triggered in a guild, false otherwise. */
	inGuild(): this is MessageCommandData<true>;
}

/** Represents the metadata of a message command. */
export interface MessageCommandMetadata {
	/** The prefix used to trigger this command. */
	prefix: string;

	/** The trigger used to trigger this command. */
	trigger: string;

	/** The whole message content except the prefix and the trigger. */
	content: string;
}

/** Represents the structure of a message command. */
export interface MessageCommandInterface extends CommandInterface {
	/** The name of the command. */
	name: string;

	/** An array of aliases for the command. */
	aliases?: string | string[];

	/** Whether the command should be executed regardless of the prefix and trigger. */
	alwaysExecute?: boolean;

	/** Whether the command should allow bots or not. */
	allowBots?: boolean;

	/**
	 * Whether the trigger of the command should be case insensitive or not.
	 * @defaultValue true
	 */
	insensitive?: boolean;

	/** A string or an array of strings describing the usage of the command. */
	usage?: string | string[];

	/** A short description of the command. */
	description?: string;

	/**
	 * The function to execute when the command is triggered.
	 * @param  data Represents the data available for a message command.
	 * @param metadata Represents the metadata of a message command.
	 */
	execute: (
		this: MessageCommand,
		data: MessageCommandData,
		metadata: MessageCommandMetadata
	) => unknown;
}

/** Represents a message command. */
export class MessageCommand extends Command {
	/** The unique id of the command. */
	id: string;

	/** The name of the command. */
	name: string;

	/** An array of aliases for the command. */
	aliases: string[];

	/** A string or an array of strings describing the usage of the command. */
	usage: string[];

	/** A short description of the command. */
	description: string | null;

	/** The category the command belongs to. */
	category: string;

	/** Whether the command should be executed regardless of the prefix and trigger. */
	alwaysExecute: boolean;

	/** Whether the command should allow bots or not. */
	allowBots: boolean;

	/** Whether the trigger of the command should be case insensitive or not. */
	insensitive: boolean;

	/** Whether the command should be ignored or not. */
	disabled: boolean;

	/** Additional metadata associated with the command. */
	metadata: unknown;

	/**
	 * The function to execute when the command is triggered.
	 * @param  data Represents the data available for a message command.
	 * @param metadata Represents the metadata of a message command.
	 */
	execute: (
		this: this,
		data: MessageCommandData,
		metadata: MessageCommandMetadata
	) => unknown;

	/**
	 * Creates a new instance of the MessageCommand class.
	 *
	 * @param cmd - The command data used to create the command instance.
	 * @param path - The path to the file where the command is located.
	 * @param id - The unique identifier for the command.
	 */
	constructor(
		cmd: MessageCommandInterface,
		path: string,
		category: string,
		id: string
	) {
		super(path);

		this.id = id;
		this.name = cmd.name;
		this.aliases = getAliases(cmd.aliases);
		this.usage = getUsage(cmd.usage);
		this.description = cmd.description || null;
		this.category = category;
		this.alwaysExecute = !!cmd.alwaysExecute;
		this.allowBots = !!cmd.allowBots;
		this.insensitive = cmd.insensitive ?? true;
		this.disabled = !!cmd.disabled;
		this.metadata = cmd.metadata;
		this.execute = cmd.execute;
	}
}
