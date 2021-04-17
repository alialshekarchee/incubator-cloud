const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    connection: {
        type: String,
        required: true,
        default: 'placeholder'
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


const Device = mongoose.model('Device', UserSchema);

module.exports = Device;
