const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: false
  },
  role: {
    type: String,
    required: false,
    default: 'peasant'
  },
  photo: {
    type: String,
    required: true,
    default: '/images/default_profile.png'
  },
  date: {
    type: Date,
    default: Date.now
  }
});


const User = mongoose.model('User', UserSchema);

module.exports = User;
