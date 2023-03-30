/** Enum representing the available log levels.*/
export enum LogLevel {
	/** Indicates that no logs should be produced. */
	NONE = 0,

	/** Indicates that a summary table should be logged. */
	TABLE = 1,

	/** Indicates that a summary table and error messages should be logged. */
	ERROR = 2,

	/**
	 * Indicates that information about file loading, error messages,
	 * and the summary table should be logged.
	 */
	VERBOSE = 3,
}
