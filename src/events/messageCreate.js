import { HfInference } from "@huggingface/inference";
import { ChannelType } from "discord.js";
import { config } from "dotenv";
const hf = new HfInference(process.env.HF_TOKEN);

config();
export async function messageCreate(client, message) {
	const getCurrentSettings = await client.prisma.settings.findMany({
		where: {
			guildId: message.guild.id,
		},
	});

	if (
		message.channel.id === getCurrentSettings[0]?.aiChannel &&
		!message.author.bot
	) {
		if (message.content.startsWith("//")) return;

		let response;

		if (message.attachments.size === 1) {
			const sentMessage = await message.reply(
				"<a:4704loadingicon:1183416396223352852> Running image classification...",
			);

			response = await hf.imageToText({
				data: message.attachments.first().url,
				model: "Salesforce/blip-image-captioning-large",
				use_cache: false,
				wait_for_model: true,
			});
			console.log(response);
			await sentMessage.edit(response.generated_text);
		}
	}

	if (
		!message.author.bot &&
		message.channel.type === ChannelType.PublicThread
	) {
		const fetchStarterMessage = await message.channel.fetchStarterMessage();

		if (
			fetchStarterMessage.embeds[0].data.footer.text.startsWith(
				"Generated by AI",
			)
		) {
			try {
				const messages = await message.channel.messages.fetch({
					limit: 100,
				});
				const pastUserMessages = messages.filter(
					(m) => m.author.id === message.author.id,
				);
				// const content = messages.map((m) => m.content);
				// console.log("contents", content);

				await message.channel.sendTyping();

				// const result = await hf.conversational({
				//   model: 'google/gemma-7b-it',
				//   inputs: {
				//     past_user_inputs: pastUserMessages.map((m) => m.content),
				//     generated_response: [fetchStarterMessage.embeds[0].data.description],
				//     text: message.content,
				//   }
				// });

				const data = {
					past_user_inputs: pastUserMessages.map((m) => m.content),
					generated_response: [
						fetchStarterMessage.embeds[0].data.description,
					],
					text: message.content,
				};

				const response = await fetch(
					"https://api-inference.huggingface.co/models/google/gemma-7b-it",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${process.env.HF_TOKEN}`,
						},
						body: JSON.stringify(data),
					},
				);
				console.log(JSON.stringify(response));
				// const botReply = result.generated_text
				// console.log("botReply", botReply);
				// await message.reply(botReply);
			} catch (e) {
				console.error(e);
				await message.reply(
					"An error occurred while generating text (Probably model time out)",
				);
			}
		}
	}
}
