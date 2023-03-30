/**
 * Interface for defining the base properties of a command.
 * @remarks This interface should be extended to define the specific properties of a command.
 */
export interface CommandInterface {
	/** Whether the command should be ignored or not. */
	disabled?: boolean;

	/**
	 * The category the command belongs to.
	 * If not provided the directory name is used.
	 */
	category?: string;

	/** Additional metadata associated with the command. */
	metadata?: unknown;

	/** The function to execute when the command is triggered. */
	execute: (...args: any[]) => unknown; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Abstract base class for defining a command.
 * @remarks This class should be extended to define the implementation details of a command.
 */
export abstract class Command {
	/** A unique identifier for the command. */
	abstract id: string;

	/** The name of the command. */
	abstract name: string;

	/** Whether the command should be ignored or not. */
	abstract disabled: boolean;

	/** Additional metadata associated with the command. */
	abstract metadata: unknown;

	/** The category the command belongs to. */
	abstract category: string;

	/** The file path of the command implementation. */
	readonly path!: string;

	/** The function to run when the command is triggered. */
	abstract execute: (...args: any[]) => unknown; // eslint-disable-line @typescript-eslint/no-explicit-any

	/**
	 * Creates a new instance of the command.
	 * @param path The file path of the command implementation.
	 */
	constructor(path: string) {
		Object.defineProperty(this, "path", { value: path, enumerable: false });
	}
}
