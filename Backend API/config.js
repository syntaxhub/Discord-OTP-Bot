module.exports = {
    setupdone: 'true',

    /**
     * Information about the Twilio account
     */
    accountSid: 'TWILIO ACCOUNT SID',
    authToken: 'TWILIO AUTH TOKEN',
    callerid: '+18882212720', // TWILIO NUMBER

    /**
     * mongodb uri
     */
    mongodb: 'mongodb://127.0.0.1:27017/mydatabasename',
    
    /**
     * Information about the API
     */
    apipassword: 'KDXdabj2lvZHkTmo',
    serverurl: 'http://127.0.0.1:6969',

    /**
     * Information about the discord webhook
     */
    discordwebhook: '',

    /**
     * Port on which the express server is running
     */
    port: process.env.PORT || 6969,
};
