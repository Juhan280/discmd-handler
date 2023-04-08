import { ButtonInteraction } from "discord.js";
import { Command, CommandInterface } from "./BaseCommand";

export interface ButtonCommandInterface extends CommandInterface {
	/** The name of the command. */
	name: string;

	/**
	 * The function to run when the command is triggered.
	 *
	 * @param interaction The interaction that triggered the command.
	 * @param metadata The part of the customId after the first "#".
	 */
	execute: (
		this: ButtonCommand,
		interaction: ButtonInteraction,
		metadata: string | null
	) => unknown;
}

export class ButtonCommand extends Command {
	/** A unique identifier for the command. */
	id: string;

	/** The name of the command. */
	name: string;

	/** Whether the command should be ignored or not. */
	disabled: boolean;

	/** Additional metadata associated with the command. */
	metadata: unknown;

	/** The category the command belongs to. */
	category: string;

	/**
	 * The function to run when the command is triggered.
	 *
	 * @param interaction The interaction that triggered the command.
	 * @param metadata The part of the customId after the first "#".
	 */
	execute: (
		this: this,
		interaction: ButtonInteraction,
		metadata: string | null
	) => unknown;

	constructor(
		cmd: ButtonCommandInterface,
		path: string,
		category: string,
		id: string
	) {
		super(path);

		this.id = id;
		this.name = cmd.name;
		this.disabled = !!cmd.disabled;
		this.metadata = cmd.metadata;
		this.category = category;
		this.execute = cmd.execute;
	}
}
