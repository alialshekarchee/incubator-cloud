const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  connection: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Connection = mongoose.model('Connection', UserSchema);

module.exports = Connection;
