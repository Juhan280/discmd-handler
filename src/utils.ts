import fs from "node:fs";
import node_path from "node:path";
import normalize from "normalize-path";
import { LogLevel } from "./enums";

export function getAliases(aliases: string | string[] | undefined) {
	if (!aliases) return [];
	let a: string[];
	if (typeof aliases === "string") a = [aliases.trim()];
	else a = aliases.map(x => x.trim());
	return a;
}

export function getCategory(root: string, path: string, category?: string) {
	if (category) return category;
	return path.replace(root, "").split(node_path.sep).slice(1, -1).join("-");
}

export function getUsage(usage?: string | string[]) {
	if (!usage) return [];
	if (typeof usage === "string") return [usage];
	return usage.map(u => u.trim());
}

export function getIdFromPath(root: string, path: string) {
	const name = path.replace(root, "").replace(/\.js$/, "");

	return Buffer.from(name).toString("base64").replace(/=+$/, "");
}

export async function getDefaultExport(path: string): Promise<unknown> {
	const module = await import(path);
	return module.__esModule ? module.default?.default : module.default;
}

export function getPath(root: string, commandsDir: string) {
	const path = node_path.join(root, commandsDir);
	if (!fs.existsSync(path)) throw new Error("path does not exist");
	return normalize(path);
}

export class Logger {
	constructor(public logLevel: LogLevel) {}

	table(tabularData?: unknown, properties?: string[] | undefined) {
		if (this.logLevel < LogLevel.TABLE) return;
		console.table(tabularData, properties);
	}

	error(...data: unknown[]) {
		if (this.logLevel < LogLevel.ERROR) return;
		console.log(...data);
	}

	verbose(...data: unknown[]) {
		if (this.logLevel < LogLevel.VERBOSE) return;
		console.log(...data);
	}
}
