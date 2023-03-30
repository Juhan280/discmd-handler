import { Client, SlashCommandBuilder } from "discord.js";
import { z } from "zod";
import { LogLevel } from "./enums";

export const stringSchema = z.string();
export const stringMin1Schema = stringSchema.min(1);
export const optionalStringSchema = stringSchema.optional();

export const unknownSchema = z.unknown();
export const functionSchema = z.function();

export const logLevelSchema = z.nativeEnum(LogLevel).optional();

export const optionalBoolSchema = z.boolean().optional();

export const componrntCommandNameSchema = stringSchema.refine(
	value => !value.includes("#"),
	'component commands cannot have "#" in their name'
);

// Optional String Or Array Of String Schema
export const osoaosSchema = z
	.array(stringMin1Schema)
	.or(stringMin1Schema)
	.optional();

export const handlerOptionSchema = z.object({
	client: z.instanceof(Client),
	commands: z.object({
		ButtonCommands: optionalStringSchema,
		ChatInputCommands: optionalStringSchema,
		MessageCommands: optionalStringSchema,
		SelectMenuCommands: optionalStringSchema,
	}),
	prefix: osoaosSchema.or(functionSchema),
	logLevel: logLevelSchema,
});

export const baseCommandSchema = z.object({
	disabled: optionalBoolSchema,
	metadata: unknownSchema,
	category: optionalStringSchema,
	execute: functionSchema,
});

export const anyComponentCommandSchema = baseCommandSchema.extend({
	name: componrntCommandNameSchema,
});

export const chatInputCommandSchema = baseCommandSchema.extend({
	data: z.instanceof(SlashCommandBuilder),
});

export const messageCommandSchema = baseCommandSchema.extend({
	name: stringSchema,
	aliases: osoaosSchema,
	description: optionalStringSchema,
	usage: osoaosSchema,
	alwaysExecute: optionalBoolSchema,
	allowBots: optionalBoolSchema,
	insensitive: optionalBoolSchema,
});

export const applicationCommandsRegisterOptionsSchema = z.object({
	token: stringSchema,
	commands: z.object({
		ChatInputCommands: stringSchema,
	}),
	logLevel: logLevelSchema,
	guildId: optionalStringSchema,
});
