const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
// Load User model
const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated, ensureAdmin } = require('../config/auth');
const { JsonWebTokenError } = require('jsonwebtoken');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// User Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  const token = jwt.sign(req.user.email, 'top-secret');
  User.findOne({ email: req.user.email }).then(user => {
    user.token = token;
    user.save().then().catch(err => console.log(err));
    if (user.role === 'god') {
      if (typeof req.query.email !== 'undefined' && req.query.email) {
        User.findOne({ email: req.query.email }).then(usr => {
          res.render('dashboard', { user: usr });
        }).catch(err => console.log(err));

      } else {
        User.find().then(users => {
          res.render('admindashboard', { user: user, users: users, msg: { msg_type: '', msg_details: '' } });
        }).catch(err => console.log(err));

      }
    } else {
      res.render('dashboard', { user: req.user });
    }
  }).catch(err => console.log(err));
});

// Admin Dashboard
router.get('/admindashboard', ensureAuthenticated, ensureAdmin, (req, res) => {
  var msg = { msg_type: '', msg_details: '' };
  if (typeof req.query.msg !== 'undefined' && req.query.msg) {
    msg.msg_type = JSON.parse(req.query.msg).msg_type;
    msg.msg_details = JSON.parse(req.query.msg).msg_details;
  }
  const token = jwt.sign(req.user.email, 'top-secret');
  User.find().then(users => {
    res.render('admindashboard', { user: req.user, users: users, msg: msg });
  }).catch(err => console.log(err));

  User.findOne({ email: req.user.email }).then(user => {
    user.token = token;
    user.save().then().catch(err => console.log(err));
  }).catch(err => console.log(err));
});

// Websocket
router.get('/ws', ensureAuthenticated, (req, res) => {
  User.findOne({ email: req.user.email }).then(user => {
    res.render('ws', {
      token: user.token
    });
  }).catch(err => console.log(err));
});

router.get('/wss', ensureAuthenticated, (req, res) => {
  User.findOne({ email: req.user.email }).then(user => {
    res.render('wss', {
      token: user.token
    });
  }).catch(err => console.log(err));
});


module.exports = router;
