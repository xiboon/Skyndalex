import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	return interaction.reply(client.i18n.t("BOT_INVITE", { lng: interaction.locale, clientId: client.user.id }));
}
export const data = new SlashCommandBuilder()
	.setName("invite")
	.setDescription("Invite");
