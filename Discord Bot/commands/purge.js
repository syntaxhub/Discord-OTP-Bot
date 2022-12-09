const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
Database = require('../Database/mongoose')
const ms = require('ms')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Purge an amount of message')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Amount of messages to delete')
                .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
        const amount = interaction.options.getInteger('amount')

        if(amount > 100)
            return interaction.reply("The maximum amount of messages you can delete is 100 messages").catch(err => {
                console.log(err)
            })

        const messages = await interaction.channel.messages.fetch({
            limit: amount
        })

        const filtered = messages.filter(
            (msg) => Date.now() - msg.createdTimestamp < ms("14 days")
        );

        await interaction.channel.bulkDelete(filtered).catch(err => {
            console.log(err)
        })
        interaction.channel.send(`Deleted ${filtered.size} messages`).then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'));
        }).catch(err => {
            console.log(err)
        })
	},
};