require('dotenv').config()
const config = process.env

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const keysModel = require("../Database/Schema/Keys")
Database = require('../Database/mongoose')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('redeem')
		.setDescription('Redeem your key you purchased')
        .addStringOption(option => 
            option.setName('key')
                .setDescription('Enter the key you received from the shop')
                .setRequired(true)
        ),
	async execute(interaction) {
        const key = interaction.options.getString('key');
		let claim = await Database.claimKey(interaction.user.username, interaction.user.discriminator, interaction.user.id, key)
        
        if(claim != "Key does not exist!"){
            let keysDB = await keysModel.findOne({ Key: key });
            let keyTime = keysDB.Time
            let keyType = keysDB.Type
            let keyCreator = keysDB.CreatedByID
            let role = interaction.guild.roles.cache.find(role => role.name === "OTP")
            
            const exist = new EmbedBuilder()
            .setColor(5763719)
            .setTitle('Syntax OTP')
            .setDescription("Key redeemed!")

            await interaction.member.roles.add(role)
            await interaction.reply({embeds:[exist]}).catch(err => {
                console.log(err)
            })

            // Admin Key Claim Log
            const logClaim = new EmbedBuilder()
            .setColor(2067276)
            .setTitle('OTP Key Claimed')
            .addFields(
                { name: 'UserID', value: `${interaction.user.id}`, inline: true },
                { name: 'User', value: `${interaction.user}`, inline: true },
                { name: 'Key', value: `${key}`, inline: true },
                { name: 'Key Time', value: `${keyTime} ${keyType}`, inline: true },
                { name: 'Created by', value: `<@${keyCreator}>`, inline: true }
            )
            let log = interaction.guild.channels.cache.find(c => c.id === config.adminlogchan)
            await log.send({embeds:[logClaim]})
        }else{
            const nonexist = new EmbedBuilder()
            .setColor(10038562)
            .setTitle('OTP')
            .setDescription(claim)
            await interaction.reply({embeds:[nonexist]}).catch(err => {
                console.log(err)
            })
        }
	},
};