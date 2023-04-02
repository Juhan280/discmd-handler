import chalk from "chalk";
import { Collection } from "discord.js";
import fg from "fast-glob";
import { z, ZodError } from "zod";
import { LogLevel } from "./enums";
import { getDefaultExport, getIdFromPath, Logger } from "./utils";

export default async function loadCommands<T>(
	sourcePath: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	CommandClass: new (cmd: any, path: string, id: string) => T & {
		name: string;
	},
	schema: z.ZodType<object>,
	logLevel: LogLevel
) {
	const logger = new Logger(logLevel);

	const commands = new Collection<string, T>();
	const errors: unknown[] = [];

	const skip = Symbol();

	for (const path of await fg(sourcePath + "/**/*.{js,cjs,mjs}")) {
		logger.verbose(chalk.hex("#837300")("Opening"), chalk.gray(path));

		const data = await getDefaultExport(path).catch(err => {
			logger.verbose(chalk.hex("#ff2052")("Failed to open"), chalk.gray(path));

			if (err instanceof Error)
				(err as Error & { sourcePath: string }).sourcePath = path;
			errors.push(err);
			return skip;
		});
		if (data === skip) continue;

		const parsed = schema.safeParse(data);
		if (!parsed.success) {
			const error = parsed.error as ZodError & { sourcePath: string };
			error.sourcePath = path;
			errors.push(error);

			logger.verbose(chalk.hex("#ff2052")("Failed to load"));
			continue;
		}

		const id = getIdFromPath(sourcePath, path);
		const command = new CommandClass(parsed.data, path, id);
		commands.set(id, command);

		logger.verbose(
			chalk.green("Loaded"),
			chalk.hex("#4458BE")(command.name),
			chalk.hex("#ffa500")(`[${CommandClass.name}]`)
		);
	}

	if (errors.length) logger.error(...errors);
	return [commands, errors] as const;
}
