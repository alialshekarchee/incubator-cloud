const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
// Load User model
const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated, ensureAdmin, ensureAuthenticatedByJWT } = require('../config/auth');
const { JsonWebTokenError } = require('jsonwebtoken');

// Users API

// Fetch all users
// router.get('/users', ensureAuthenticatedByJWT, ensureAdmin, (req, res) => {
//   User.find().then(users => {
//     res.status(200);
//     res.send( {users: users} );
//   }).catch(err => console.log(err));
// });

// Fetch single user
router.get();

// Create new user
router.post();

// Update user
router.put();

// Delete user
router.delete();

// Devices API

// Fetch all devices
router.get();

// Fetch single device
router.get();

// Create new device
router.post();

// Update device
router.put();

// Delete device
router.delete();





// // Welcome Page
// router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// // User Dashboard
// router.get('/dashboard', ensureAuthenticated, (req, res) => {
//   const token = jwt.sign(req.user.email, 'top-secret');
//   res.render('dashboard', { user: req.user });
//   User.findOne({ email: req.user.email }).then(user => {
//     user.token = token;
//     user.save().then().catch(err => console.log(err));
//   }).catch(err => console.log(err));
// });

// // Admin Dashboard
// router.get('/admindashboard', ensureAuthenticated, ensureAdmin, (req, res) => {
//   const token = jwt.sign(req.user.email, 'top-secret');
//   User.find().then(users => {
//     res.render('admindashboard', { user: req.user, users: users });
//   }).catch(err => console.log(err));
  
//   User.findOne({ email: req.user.email }).then(user => {
//     user.token = token;
//     user.save().then().catch(err => console.log(err));
//   }).catch(err => console.log(err));
// });

// // Websocket
// router.get('/ws', ensureAuthenticated, (req, res) => {
//   User.findOne({ email: req.user.email }).then(user => {
//     res.render('ws', {
//       token: user.token
//     });
//   }).catch(err => console.log(err));
// });

// router.get('/wss', ensureAuthenticated, (req, res) => {
//   User.findOne({ email: req.user.email }).then(user => {
//     res.render('wss', {
//       token: user.token
//     });
//   }).catch(err => console.log(err));
// });


module.exports = router;
