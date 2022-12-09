const mongoose = require('mongoose')

module.exports = mongoose.model('Users', new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Discrim: {
        type: String,
        required: true
    },
	UserID: {
        type: String,
        required: true
    },
    Time: {
        type: Date,
        Default: undefined
    }
}))