const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    connection: {
        type: String,
        required: false
    },
    token: {
        type: String,
        required: false
    },
    uuid: {
        type: String,
        required: false,
        default: 'peasant'
    },
    date: {
        type: Date,
        default: Date.now
    }
});


const User = mongoose.model('User', UserSchema);

module.exports = User;
