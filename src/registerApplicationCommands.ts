import chalk from "chalk";
import {
	REST,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
} from "discord.js";
import fg from "fast-glob";
import { ZodError } from "zod";
import { LogLevel } from "./enums";
import { getDefaultExport, getPath, Logger } from "./utils";
import {
	chatInputCommandSchema,
	applicationCommandsRegisterOptionsSchema,
} from "./zodSchemas";

/** Options for registering slash commands. */
export interface ChatInputCommandsRegisterOptions {
	/** The Discord bot token. */
	token: string;
	/** The directory containing the slash command modules. */
	commands: {
		ChatInputCommands: string;
	};
	/**
	 * The logging level.
	 * @defaultValue {@link LogLevel.ERROR | LogLevel.ERROR}
	 */
	logLevel?: LogLevel;
	/**
	 * The ID of the guild to register commands in.
	 * If not specified, the global application commands will be registered instead.
	 */
	guildId?: string;
}

/**
 * Registers slash commands for a Discord bot application.
 *
 * @remarks
 * This function reads all `.js`, `.cjs` and `.mjs` files in a specified directory and attempts to parse them as chat input commands
 * for Discord slash commands. It then sends the commands to the Discord API using the provided bot token.
 *
 * @param options - An object containing options for registering the slash commands.
 * @returns An object containing the registered commands and any errors encountered during registration.
 *
 * @example
 * ```ts
 * import { registerApplicationCommands } from "discmd-handler";
 *
 * registerApplicationCommands({
 *   token: process.env.DISCORD_TOKEN,
 *   commands: {
 *     ChatInputCommands: "commands/chat-input",
 *   },
 * });
 * ```
 */
export async function registerApplicationCommands(
	options: ChatInputCommandsRegisterOptions
) {
	applicationCommandsRegisterOptionsSchema.parse(options);
	const logger = new Logger(options.logLevel ?? LogLevel.ERROR);

	const applicationIdInBase64 = options.token.split(".")[0];
	if (typeof applicationIdInBase64 !== "string") throw new Error(); // this will never throw

	const rest = new REST().setToken(options.token);
	const applicationId = Buffer.from(applicationIdInBase64, "base64").toString();
	const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
	const errors: unknown[] = [];
	const skip = Symbol();

	for (const path of await fg(
		getPath(process.cwd(), options.commands.ChatInputCommands) +
			"/**/*.{js,cjs,mjs}"
	)) {
		logger.verbose(chalk.hex("#837300")("Opening"), chalk.gray(path));

		const data = await getDefaultExport(path).catch(err => {
			logger.verbose(chalk.hex("#ff2052")("Failed to open"), chalk.gray(path));

			if (err instanceof Error)
				(err as Error & { sourcePath: string }).sourcePath = path;
			errors.push(err);
			return skip;
		});
		if (data === skip) continue;
		const parsed = chatInputCommandSchema.safeParse(data);
		if (!parsed.success) {
			const error = parsed.error as ZodError & { sourcePath: string };
			error.sourcePath = path;
			errors.push(error);

			logger.verbose(chalk.hex("#ff2052")("Failed to load"));
			continue;
		}
		if (parsed.data.disabled) {
			logger.verbose(
				chalk.hex("#4458BE")(parsed.data.data.name),
				"is disabled"
			);
			continue;
		}

		logger.verbose(
			chalk.green("Loaded"),
			chalk.hex("#4458BE")(parsed.data.data.name)
		);

		commands.push(parsed.data.data.toJSON());
	}

	let route: `/${string}`;
	if (options.guildId)
		route = Routes.applicationGuildCommands(applicationId, options.guildId);
	else route = Routes.applicationCommands(applicationId);

	logger.verbose(
		chalk.hex("#837300")(
			`\nRegistering ${
				options.guildId ? "local" : "global"
			} application commands...`
		)
	);
	await rest.put(route, { body: commands });

	if (errors.length) logger.error(...errors);
	logger.table({
		Registered: commands.length,
		Errors: errors.length,
	});

	return { commands, errors };
}
