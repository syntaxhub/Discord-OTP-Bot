const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
Database = require('../Database/mongoose')



module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Everything you need to know!'),
	async execute(interaction) {
        const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Syntax OTP | Commands')
        .addFields(
            { name: 'Buy', value: '/buy', inline: true },
            { name: 'Time', value: '/time', inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Call', value: '/call phone:1234567890 name:Jim service:PayPal', inline: true },
            { name: 'Redeem', value: '/redeem key:12345-12345-12345', inline: true },
        )
		await interaction.reply({embeds:[exampleEmbed]}).catch(err => {
            console.log(err)
        });
	},
};