const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
// Load User model
const User = require('../models/User');

// Load User model
const Device = require('../models/Device');

// Load Auth strategies
const { ensureAuthenticated, forwardAuthenticated, ensureAdmin, ensureAuthenticatedByJWT, ensureAdminByJWT } = require('../config/auth');
const { JsonWebTokenError } = require('jsonwebtoken');

// Users API

// Fetch all users
router.get('/users', ensureAuthenticatedByJWT, ensureAdminByJWT, (req, res) => {
  User.find().then(users => {
    res.status(200).send({ users: users });
  }).catch(err => console.log(err));
});

// Fetch single user
router.get('/user', ensureAuthenticatedByJWT, ensureAdminByJWT, (req, res) => {
  User.findOne({ email: req.query.email }).then(user => {
    if (!user) {
      res.status(404).send({ msg: 'Not registered' });
    } else {
      res.status(200).send({ user: user });
    }

  }).catch(err => console.log(err));
});

// Create new user
router.post('/user', ensureAuthenticatedByJWT, ensureAdminByJWT, (req, res) => {
  const { name, email, password, role } = req.body;
  User.findOne({ email: email }).then(user => {
    if (!user) {
      const user = new User({ name: name, email: email, password: password, role: role });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) throw err;
          user.password = hash;
          user.save().then(() => {
            res.status(200).send({ msg_type: 'error', msg_details: `User ${email} created` });
          }).catch(err => console.log(err));
        });
      });
    } else {
      res.status(200).send({ msg_type: 'error', msg_details: 'User already registered' });
    }
  }).catch(err => console.log(err));
});
// Update user
router.put('/user', ensureAuthenticatedByJWT, ensureAdminByJWT, (req, res) => {
  // console.log(req.body)
  // console.log(req.query)
  User.findOne({ email: req.query.email }).then(user => {
    if (!user) {
      res.status(404).send({ msg_type: 'error', msg_details: 'User not found' });
    } else {
      const { name, password, role } = req.body;
      user.name = name;
      user.email = req.query.email;
      user.role = role;
      if (password !== 'change_password') {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user.save().then(() => {
              res.status(200).send({ msg_type: 'success', msg_details: `User ${user.email} updated` });
            }).catch(err => console.log(err));
          });
        });
      } else {
        user.save().then(() => {
          res.status(200).send({ msg_type: 'success', msg_details: `User ${user.email} updated` });
        }).catch(err => console.log(err));
      }
    }
  }).catch(err => console.log(err));
});

// Delete user
router.delete('/user', ensureAuthenticatedByJWT, ensureAdminByJWT, (req, res) => {
  User.findOne({ email: req.query.email }).then(user => {
    if (!user) {
      res.status(200).send({ msg_type: 'error', msg_details: 'User not found' });
    } else {
      User.deleteOne(user).then(() => {
        res.status(200).send({ msg_type: 'success', msg_details: `User ${user.email} deleted` });
      }).catch(err => console.log(err));
    }
  }).catch(err => console.log(err));
});

// Devices API

// Fetch all devices
router.get('/devices', ensureAuthenticatedByJWT, ensureAdminByJWT, (req, res) => {
  User.findOne({ email: req.query.email }).then(user => {
    Device.find({ token: user.token }).then(devices => {
      if (!devices.length > 0) {
        res.status(404).send({ msg: 'User has no registered devices' });
      } else {
        res.status(200).send({ devices: devices });
      }
    }).catch(err => console.log(err));
  }).catch(err => console.log(err));

});

// // Fetch single device
// router.get();

// // Create new device
// router.post();

// // Update device
// router.put();

// // Delete device
// router.delete();





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
