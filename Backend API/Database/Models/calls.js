const mongoose = require('mongoose')

module.exports = mongoose.model('Calls', new mongoose.Schema({
    itsfrom: {
        type: String
    },
    itsto: {
        type: String
    },
    digits: {
        type: String
    },
    callsid: {
        type: String
    },
    digitlength: {
        type: Number
    },
    status: {
        type: String
    },
    date: {
        type: Date
    },
    user: {
        type: String
    },
    name: {
        type: String
    },
    service: {
        type: String
    }
}))