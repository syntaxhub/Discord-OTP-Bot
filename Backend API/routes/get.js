module.exports = async function(request, response) {
    /**
     * Mongodb Calls Collection
     */
    const callsModel = require('../Database/Models/calls')

    var callSid = request.body.callSid;

    /**
     * GET command to the DB to retrieve information on a call made,
     * use of callSid.
     */
    let calls = await callsModel.findOne({ callsid: callSid })
    if (calls == undefined) {
        /**
         * If the call is not found in db, error return
         */
        response.status(200).json({
            error: 'Invalid callSid.'
        });
    } else {
        /**
         * Otherwise take the info in DB and return it
         */
        
         response.status(200).json({
            itsto: calls.itsto,
            itsfrom: calls.itsfrom,
            callSid: calls.callSid,
            digits: calls.digits,
            status: calls.status,
            digitleng: calls.digitleng,
            date: calls.date,
            user: calls.user,
            service: calls.service
        });
    }
};