import { Collection, EmbedBuilder } from "discord.js";
import { readdir } from "fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const commands = new Collection();

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function loadCommands(path = "../commands") {
  const files = await readdir(resolve(__dirname, path), {
    withFileTypes: true,
  });

  const filesMap = files.map(async (file) => {
    if (file.isFile() && file.name.endsWith(".js")) {
      const { default: command } = await import(`${path}/${file.name}`);
      commands.set(command.data.name, command);
    } else if (file.isDirectory()) {
      await loadCommands(`${path}/${file.name}`);
    }
  });

  await Promise.all(filesMap);
}

export async function onCommandInteraction(client, interaction) {
  const command = commands.get(interaction.commandName);
  if (!command)
    return interaction.reply({
      content: `Command \`${command}\` not found!`,
      ephemeral: true,
    });

  try {
    if (interaction.isAutocomplete()) {
      await command.autocomplete(interaction);
    }
    if (interaction.isCommand()) {
      await command.execute(client, interaction);
    }
  } catch (error) {
    // TODO: move it to strings.json
    const errorMessages = {
      "work": {
        "cooldown": "`cooldown` parameter is missing in **bot settings, contact with the guild administrator.**",
        "permission": "Guild administrator did not set up permissions correctly!",
        "replace": "Guild needs to set up the **sentences** for the work command!"
      },
      "crime": {
        "cooldown": "`cooldown` parameter is missing in **bot settings, contact with the guild administrator.**",
        "permission": "Guild administrator did not set up permissions correctly!",
        "replace": "Guild needs to set up the **sentences** for the work command!"
      },
      "slut": {
        "cooldown": "`cooldown` parameter is missing in **bot settings, contact with the guild administrator.**",
        "permission": "Guild administrator did not set up permissions correctly!",
        "replace": "Guild needs to set up the **sentences** for the work command!"
      }
    };
    let errorMessage = error.message;
    const commandName = command.data.name;

    if (errorMessages[commandName]) {
      for (const [key, message] of Object.entries(errorMessages[commandName])) {
        if (errorMessage.includes(key)) {
          errorMessage = message;
          break;
        }
      }
    }

    if (errorMessage !== error.message) {
      await interaction.reply({ content: `${errorMessage}`, ephemeral: true });
    } else {
      const embedError = new EmbedBuilder()
        .setDescription(`\`\`\`${error}\`\`\``)
        .addFields([
          { name: "Command", value: `\`${command.data.name}\``, inline: true },
          {
            name: "Executed by",
            value: `<@${interaction.user.id}> [${interaction.user.username}]`,
            inline: true,
          },
          {
            name: "Guild",
            value: `\`${interaction.guild.id}\` [${interaction.guild.name}]`,
            inline: true,
          },
          {
            name: "Channel",
            value: `<#${interaction.channel.id}> [${interaction.channel.name}]`,
            inline: true,
          },
        ])
        .setFooter({
          text: `This embed was sent to the developers.`,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp()
        .setColor("DarkButNotBlack");

      if (interaction.replied || interaction.deferred) {
        client.channels.cache
          .get("1071407744894128178")
          .send({ embeds: [embedError] });
        await interaction.reply({ embeds: [embedError] });
      } else {
        client.channels.cache
          .get("1071407744894128178")
          .send({ embeds: [embedError] });
        await interaction.reply({ embeds: [embedError] });
      }
    }

  }
}
