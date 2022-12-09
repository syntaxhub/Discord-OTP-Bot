const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
Database = require('../Database/mongoose')
const moment = require('moment');
moment.suppressDeprecationWarnings = true;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription('Check your subscription time'),
	async execute(interaction) {
		let checkTime = await Database.checkTime(interaction.user.username, interaction.user.discriminator, interaction.user.id)
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Syntax OTP')
            .addFields(
                { name: 'Username', value: `${interaction.user}` },
                { name: 'Subscription Expiration', value: `${checkTime}` }
            )
        await interaction.reply({embeds:[embed]}).catch(err => {
            console.log(err)
        })
	},
};