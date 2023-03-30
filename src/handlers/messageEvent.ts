import { Awaitable, Client, Collection, Events, Message } from "discord.js";
import {
	MessageCommand,
	MessageCommandData,
	MessageCommandMetadata,
} from "../commands/MessageCommand";

export default function handleMessageCreateEvent(
	client: Client,
	commands: Collection<string, MessageCommand>,
	getPrefix:
		| string
		| string[]
		| ((message: Message) => Awaitable<string | string[]>)
) {
	client.on(Events.MessageCreate, async message => {
		const data: MessageCommandData = {
			client,
			message,
			author: message.author,
			channel: message.channel,
			guild: message.guild,
			member: message.member,
			inGuild() {
				return message.inGuild();
			},
			args: [],
		};

		let prefix: string | undefined,
			foundPrefix = false;

		for (const command of commands.values()) {
			if (command.disabled || (!command.allowBots && message.author.bot))
				continue;

			if (command.alwaysExecute) {
				const metadata: MessageCommandMetadata = {
					prefix: "",
					trigger: "",
					content: message.content,
				};

				data.args = message.content.split(/\s+/g);

				Promise.resolve()
					.then(() => command.execute(data, metadata))
					.catch(console.trace);
			} else {
				if (!foundPrefix) {
					foundPrefix = true;
					let prefixes: string[];
					if (typeof getPrefix === "string") prefixes = [getPrefix];
					else if (Array.isArray(getPrefix)) prefixes = getPrefix;
					else {
						const _prefixes = await getPrefix(message);
						if (typeof _prefixes === "string") prefixes = [_prefixes];
						else prefixes = _prefixes;
					}

					prefix = prefixes
						.sort((x, y) => y.length - x.length)
						.find(x =>
							message.content.toLowerCase().startsWith(x.toLowerCase())
						);
				}
				if (!prefix) continue;

				const noPrefixMessage = message.content.slice(prefix.length).trim();

				const insensitive = command.insensitive ? "i" : "";
				const trigger = [command.name, ...command.aliases]
					.sort((a, b) => b.length - a.length)
					.find(x =>
						new RegExp(`${x}(?:\\s+|$)`, insensitive).test(noPrefixMessage)
					);

				if (!trigger) continue;

				const metadata: MessageCommandMetadata = {
					prefix,
					trigger,
					content: noPrefixMessage.slice(trigger.length).trim(),
				};
				data.args = metadata.content.split(/\s+/g);

				Promise.resolve()
					.then(() => command.execute(data, metadata))
					.catch(console.trace);
			}
		}
	});
}
