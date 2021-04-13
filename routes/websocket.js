const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');


router.get('/', (req, res) => {
    console.log('ws')
    // res.sendFile(__dirname + '../index.html');
});