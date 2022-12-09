const mongoose = require('mongoose')

module.exports = mongoose.model('Keys', new mongoose.Schema({
	Key: {
        type: String,
        required: true
    },
    Time: {
        type: Number,
        required: true
    },
    Type: {
        type: String,
        required: true
    },
    ClaimedBy: {
        type: String,
        default: undefined
    },
    Claimed: {
        type: Boolean,
        required: true,
        default: false
    },
    CreatedByID: {
        type: String,
        required: true
    }
}))