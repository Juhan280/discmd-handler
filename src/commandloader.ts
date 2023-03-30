import { Collection } from "discord.js";
import fg from "fast-glob";
import { z, ZodError } from "zod";
import { LogLevel } from "./enums";
import { getDefaultExport, getIdFromPath } from "./utils";

export default async function loadCommands<T>(
	sourcePath: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	CommandClass: new (cmd: any, path: string, id: string) => T,
	schema: z.ZodType<object>,
	logLevel: LogLevel
) {
	const commands = new Collection<string, T>();
	const errors: unknown[] = [];

	const skip = Symbol();

	for (const path of await fg(sourcePath + "/**/*.js")) {
		const data = await getDefaultExport(path).catch(err => {
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
			continue;
		}

		const id = getIdFromPath(sourcePath, path);
		commands.set(id, new CommandClass(parsed.data, path, id));
	}

	if (logLevel >= LogLevel.ERROR && errors.length) console.log(...errors);
	return [commands, errors] as const;
}
