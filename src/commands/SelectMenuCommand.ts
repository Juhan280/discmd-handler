import { AnySelectMenuInteraction } from "discord.js";
import { getCategory } from "../utils";
import { Command, CommandInterface } from "./BaseCommand";

export interface SelectMenuCommandInterface extends CommandInterface {
	/** The name of the command. */
	name: string;

	/**
	 * The function to run when the command is triggered.
	 *
	 * @param interaction The interaction that triggered the command.
	 * @param metadata The part of the customId after the first "#".
	 */
	execute: (
		this: SelectMenuCommand,
		interaction: AnySelectMenuInteraction,
		metadata: string | null
	) => unknown;
}

export class SelectMenuCommand extends Command {
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
		interaction: AnySelectMenuInteraction,
		metadata: string | null
	) => unknown;

	constructor(cmd: SelectMenuCommandInterface, path: string, id: string) {
		super(path);

		this.id = id;
		this.name = cmd.name;
		this.disabled = !!cmd.disabled;
		this.metadata = cmd.metadata;
		this.category = getCategory(path, cmd.category);
		this.execute = cmd.execute;
	}
}
