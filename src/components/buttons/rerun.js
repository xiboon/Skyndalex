import { HfInference } from "@huggingface/inference";
import {
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} from "discord.js";

const hf = new HfInference(process.env.HF_TOKEN);
export async function run(client, interaction) {
	try {
		console.log(interaction.message.embeds[0]);
		const prompt =
			interaction.message.embeds[0].description.split("Input: ")[1];
		const response = await hf.textToImage({
			inputs: prompt,
			model: "stabilityai/stable-diffusion-2-1",
			parameters: {
				negative_prompt: "blurry",
			},
			use_cache: false,
			wait_for_model: true,
		});

		const sentMessage = await interaction.reply(
			"<a:4704loadingicon:1183416396223352852> Re-initialization... (Input: ${prompt})",
		);

		if (response?.error) {
			const errorEmbed = new EmbedBuilder()
				.setColor("#e74c3c")
				.setDescription("❌ Error: " + response.error);
			await sentMessage.edit({ embeds: [errorEmbed] });
			return;
		}

		console.log(response);
		if (response.type === "application/json") {
			const cannotLoad = new EmbedBuilder()
				.setColor("#e74c3c")
				.setDescription(
					"❌ Still cannot load the image. The same error.",
				);
			await sentMessage.edit({ embeds: [cannotLoad] });
			return;
		}

		const imageBuffer = await response.arrayBuffer();
		const image = new AttachmentBuilder(
			Buffer.from(imageBuffer),
			"image.png",
		);

		const newEmbed = new EmbedBuilder()
			.setDescription(
				`✅ Generated img "**${prompt}**" requested from input by **${interaction.user.username}**`,
			)
			.setColor("#12ff00");

		const botMessage = await sentMessage.edit({
			embeds: [newEmbed],
			files: [image],
		});

		const newDownload = new ButtonBuilder()
			.setURL(botMessage.attachments.first().url)
			.setLabel("Download")
			.setStyle(ButtonStyle.Link);

		const like = new ButtonBuilder()
			.setCustomId("like")
			.setLabel("👍")
			.setStyle(ButtonStyle.Primary);

		const dislike = new ButtonBuilder()
			.setCustomId("dislike")
			.setLabel("👎")
			.setStyle(ButtonStyle.Primary);

		const deleteAttachment = new ButtonBuilder()
			.setCustomId("deleteAttachment")
			.setLabel("Delete")
			.setStyle(ButtonStyle.Danger);

		await botMessage.edit({
			components: [
				{
					type: 1,
					components: [newDownload, like, dislike, deleteAttachment],
				},
			],
		});
		sentMessage.edit("✅ Re-initialization... Done!");

		const secondMessage = new EmbedBuilder()
			.setColor("#12ff00")
			.setDescription("✅ Your image is ready!");
		await interaction.followUp({
			content: `<@${interaction.user.id}>,`,
			embeds: [secondMessage],
		});
	} catch (error) {
		console.error(error);
	}
}
