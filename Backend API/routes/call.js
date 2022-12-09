module.exports = async function(request, response) {
    /**
     * Mongodb Calls Collection
     */
     const callsModel = require('../Database/Models/calls')

    /**
     * File containing the configurations necessary for the proper functioning of the system
     */
    const config = require('../config');

    /**
     * Twilio identification and declaration
     */
    const client = require('twilio')(config.accountSid, config.authToken);

    /**
    *   Recovery of the posted variables allowing to order the call     
    */
    var to = request.body.to || null;
    var user = request.body.user || null;
    var service = request.body.service || null;
    var name = request.body.name || null;
    var digitl = request.body.digitleng || null;
    var callSid = null;
    /**
    * If one of the variables is missing, transmit the error and prevent the operation of the system     
    */
    if (to == null || user == null || service == null) {
        return response.status(200).json({
            error: 'Please post all the informations needed.'
        });
    }

    if (!!!user) {
        return response.status(200).json({
            error: "Bad user name."
        });
    }

    if (!!!service) {
        return response.status(200).json({
            error: "Bad service name."
        });
    }

    /**
     * If the phone number is correct, then we start the call
     */
    if (!to.match(/^\d{8,14}$/g)) {
        return response.status(200).json({
            error: 'Bad phone number.'
        });
    }

    /**
     * Twilio API to issue the call
     */
    client.calls.create({
        method: 'POST',
        machineDetection: 'Enable',
        machineDetectionTimeout: 5,
        record: true,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: "POST",
        statusCallback: config.serverurl + '/status/' + config.apipassword,
        //recordingStatusCallbackEvent: ['in-progress', 'answered', 'completed'],
        url: config.serverurl + '/voice/' + config.apipassword,
        to: to,
        from: config.callerid
    }).then(async (call) => {
        callSid = call.sid;
        /**
         * Addition to the Mongo DB of the launched call
         */
        let calls = await callsModel.findOne({ callsid: callSid })
        if(calls == undefined){
            calls = new callsModel({
                callsid: callSid,
                user: user,
                service: service,
                itsto: to,
                digitlength: digitl,
                name: name,
                date: Date.now()
            })
            await calls.save().catch(err => console.log(err));
        }else{
            await callsModel.findOneAndUpdate({callsid: callSid}, {
                user: user,
                service: service,
                itsto: to,
                callsid: callSid,
                digitlength: digitl,
                name: name,
                date: Date.now()
            })
        }

        response.status(200).json({
            callSid
        });
    }).catch(error => {
        return response.status(200).json({
            error: 'There was a problem with your call, check if your account is upgraded. ' + error
        });
    });

};
