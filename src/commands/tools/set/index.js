import {
	ActionRowBuilder,
	EmbedBuilder, PermissionFlagsBits,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from "discord.js";
export const data = new SlashCommandBuilder()
	.setName("set")
	.setDescription("Guild settings")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)