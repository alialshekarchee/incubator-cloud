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
            res.status(200).send({ msg_type: 'success', msg_details: `User ${email} created` });
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

// Devices Admin API

// Fetch all devices or all devices for a specific user only
router.get('/devices', ensureAuthenticatedByJWT, ensureAdminByJWT, (req, res) => {
  if (req.query.email) {
    User.findOne({ email: req.query.email }).then(user => {
      if (!user) {
        res.status(404).send({ msg: 'User not found' });
      } else {
        Device.find({ token: user.token }).then(devices => {
          if (!devices.length > 0) {
            res.status(404).send({ msg: 'User has no registered devices' });
          } else {
            res.status(200).send({ devices: devices });
          }
        }).catch(err => console.log(err));
      }
    }).catch(err => console.log(err));
  } else {
    Device.find().then(devices => {
      if (!devices.length > 0) {
        res.status(404).send({ msg: 'No registered devices' });
      } else {
        res.status(200).send({ devices: devices });
      }
    }).catch(err => console.log(err));
  }
});

// Fetch single device
router.get('/device', ensureAuthenticatedByJWT, ensureAdminByJWT, (req, res) => {
  if (!req.query.uuid) {
    res.status(400).send({ msg: 'Bad request' });
  } else {
    Device.findOne({ uuid: req.query.uuid }).then(device => {
      if (!device) {
        res.status(404).send({ msg: 'Device not found' });
      } else {
        res.status(200).send({ device: device });
      }
    }).catch(err => console.log(err));
  }
});

// Create new device
router.post('/device', ensureAuthenticatedByJWT, ensureAdminByJWT, (req, res) => {
  const { name, uuid } = req.body;
  Device.findOne({ uuid: uuid }).then(device => {
    if (!device) {
      const device = new Device({ name: name, uuid: uuid });
      device.save().then(() => {
        res.status(200).send({ msg: 'Device registered' });
      }).catch(err => console.log(err));
    } else {
      res.status(409).send({ msg: 'Device already registered' });
    }
  }).catch(err => console.log(err));
});

// Update device
router.put('/device', ensureAuthenticatedByJWT, ensureAdminByJWT, (req, res) => {
  if (!req.query.uuid) {
    res.status(400).send({ msg: 'Bad request' });
  }
  Device.findOne({ uuid: req.query.uuid }).then(device => {
    if (!device) {
      res.status(404).send({ msg: 'Device not registered' });
    } else {
      if (!req.body.email || !req.body.name) {
        res.status(400).send({ msg: 'Bad request' });
      } else {
        const { name, email } = req.body;
        if (email === 'Deactivated') {
          device.token = email;
          device.name = name;
          device.email = email;
          device.save().then(() => {
            res.status(200).send({ msg: 'Device updated' });
          }).catch(err => console.log(err));
        } else {
          User.findOne({ email: email }).then(user => {
            if (!user) {
              res.status(404).send({ msg: 'Account invalid' });
            } else {
              device.token = user.token;
              device.name = name;
              device.email = email;
              device.save().then(() => {
                res.status(200).send({ msg: 'Device updated' });
              }).catch(err => console.log(err));
            }
          }).catch(err => console.log(err));
        }
      }
    }
  }).catch(err => console.log(err));
});

// Delete device
router.delete('/device', ensureAuthenticatedByJWT, ensureAdminByJWT, (req, res) => {
  if (!req.query.uuid) {
    res.status(400).send({ msg: 'Bad request' });
  } else {
    Device.findOne({ uuid: req.query.uuid }).then(device => {
      if (!device) {
        res.status(404).send({ msg: 'Device not registered' });
      } else {
        Device.deleteOne(device).then(() => {
          res.status(200).send({ msg: 'Device deleted' });
        }).catch(err => console.log(err));
      }
    }).catch(err => console.log(err));
  }
});


// Devices User API

// Fetch all devices
router.get('/user/devices', ensureAuthenticatedByJWT, (req, res) => {
  Device.find({ token: req.headers['x-access-token'] }).then(devices => {
    if (!devices.length > 0) {
      res.status(404).send({ msg: 'No devices registered' });
    } else {
      res.status(200).send({ devices: devices });
    }
  }).catch(err => console.log(err));
});

// Fetch single device
router.get('/user/device', ensureAuthenticatedByJWT, (req, res) => {
  if (!req.query.uuid) {
    res.status(400).send({ msg: 'Bad request' });
  } else {
    Device.find({ token: req.headers['x-access-token'] }).then(devices => {
      var flag = false;
      devices.forEach(device => {
        if (device.uuid === req.query.uuid) {
          flag = true;
          res.status(200).send({ device: device });
        }
      });
      if (!flag) {
        res.status(400).send({ msg: 'Bad request' });
      }
    }).catch(err => console.log(err));
  }
});

// Activate/Deactivate device
router.put('/user/device', ensureAuthenticatedByJWT, (req, res) => {
  User.findOne({ token: req.headers['x-access-token'] }).then(user => {
    if (!req.query.uuid) {
      res.status(400).send({ msg: 'Bad request' });
    } else {
      Device.findOne({ uuid: req.query.uuid }).then(device => {
        if (!device) {
          res.status(400).send({ msg: 'Bad request' });
        }
        if (device.token !== 'unregistered' && device.token !== user.token) {
          res.status(400).send({ msg: 'Bad request' });
        } else if (device.token === user.token) {
          if (req.body.name) {
            device.name = req.body.name;
            device.save().then(() => {
              res.status(200).send({ msg: 'Device renamed' });
            }).catch(err => console.log(err));
          }
        } else {
          device.email = user.email;
          device.token = user.token;
          if (req.body.name) {
            device.name = req.body.name;
          }
          device.save().then(() => {
            res.status(200).send({ msg: 'Device registered' });
          }).catch(err => console.log(err));
        }
      }).catch(err => console.log(err));
    }
  }).catch(err => console.log(err));
});


// Delete a device
router.delete('/user/device', ensureAuthenticatedByJWT, (req, res) => {
  if (!req.query.uuid) {
    res.status(400).send({ msg: 'Bad request' });
  }
  Device.findOne({ uuid: req.query.uuid }).then(device => {
    if (!device) {
      res.status(400).send({ msg: 'Bad request' });
    }
    if (device.token === req.headers['x-access-token']) {
      device.email = 'unregistered';
      device.token = 'unregistered';
      device.name = 'New Device';
      device.save().then(() => {
        res.status(200).send({ msg: 'Device removed' });
      }).catch(err => console.log(err));
    } else {
      res.status(403).send({ msg: 'Access denied' });
    }
  }).catch(err => console.log(err));
});

module.exports = router;
