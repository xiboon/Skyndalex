import {
	EmbedBuilder,
	SlashCommandBuilder,
	PermissionFlagsBits,
} from "discord.js";

export async function run(client, interaction) {
	const member = interaction.options.getUser("user") || interaction.user;
	const user = await client.prisma.economy.findFirst({
		where: { uid: member.id },
	});

	const settings = await client.prisma.economy.findFirst({
		where: { guildId: interaction.guild.id },
	});

	await client.prisma.economy.upsert({
		where: {
			uid_guildId: {
				guildId: interaction.guild.id,
				uid: member.id,
			},
		},
		create: {
			guildId: interaction.guild.id,
			uid: member.id,
			wallet: interaction.options.getInteger("amount").toString(),
		},
		update: {
			wallet: (
				parseInt(user?.wallet || "0") -
				interaction.options.getInteger("amount")
			).toString(),
		},
	});

	const embedAdded = new EmbedBuilder()
		.setColor("#00ff00")
		.setDescription(
			`Removed ${interaction.options.getInteger("amount").toString()} ${
				settings?.currency || "🌈"
			} from <@${member.id}> \`[${member.username}]\` account`,
		);
	await interaction.reply({ embeds: [embedAdded] });
}
export const data = new SlashCommandBuilder()
	.setName("take-money")
	.setDescription("Take money from someone")
	.addIntegerOption((option) =>
		option.setName("amount").setDescription("Amount").setRequired(true),
	)
	.addUserOption((option) => option.setName("user").setDescription("User"))
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
