const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
Database = require('../Database/mongoose')

const exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle('Syntax OTP | Shop')
	.setURL('https://www.poof.io/@SyntaxOTP')
	.addFields(
		{ name: '1 Day', value: '$4.99' },
		{ name: '1 Week', value: '$25.99' },
		{ name: '1 Month', value: '$69.99' },
		{ name: 'Lifetime', value: '$199.99' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Shop', value: 'https://www.poof.io/@SyntaxOTP' },
		{ name: 'Accepted Payment Methods', value: 'BTC' },
	)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buy')
		.setDescription('Returns the shop link'),
	async execute(interaction) {
		await interaction.channel.send({embeds:[exampleEmbed]});
	},
};