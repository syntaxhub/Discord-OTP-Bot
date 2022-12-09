const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
Database = require('../Database/mongoose')

const choices = ['1h', '1d', '3d', '1w', '2w', '1m']

module.exports = {
	data: new SlashCommandBuilder()
		.setName('keygen')
		.setDescription('Generate keys')
        .addIntegerOption(option => 
            option.setName('time')
                .setDescription('Time the key will last once claimed.')
                .setRequired(true)
        ).addStringOption(option => 
            option.setName('type')
                .setDescription('Hours, Days, Weeks, or Months')
                .setRequired(true)
                .addChoices(
					{ name: 'Hours', value: 'hours' },
					{ name: 'Days', value: 'days' },
					{ name: 'Weeks', value: 'weeks' },
					{ name: 'Months', value: 'months' },
				)
        ).addIntegerOption(option => 
            option.setName('amount')
                .setDescription('How many keys to generate')
                .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
        const time = interaction.options.getInteger('time');
        const type = interaction.options.getString('type');
        const amount = interaction.options.getInteger('amount');

        if(type == "hours" || type == 'days' || type == 'weeks' || type == 'months'){
            if(amount > 15){
                await interaction.reply(`Maximum amount of keys you can generate is 15`).catch(err => {
                    console.log(err)
                })
            }else{
                let genKey = await Database.generateKeys(time, amount, type, interaction.user.id)
                await interaction.reply(`Generated **${amount}** key(s) for **${time} ${type}**\nKey(s): **${genKey}**`).catch(err => {
                    console.log(err)
                })
            }
        }else{
            await interaction.reply(`You provided the type **${type}** this is invalid.`).catch(err => {
                console.log(err)
            })
        }
	},
};