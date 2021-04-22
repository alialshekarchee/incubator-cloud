const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const fs = require('fs');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated, ensureAuthenticated, ensureAuthenticatedByJWT } = require('../config/auth');


// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});


// Obtain Token
router.post('/auth', (req, res) => {
  // const { email, password } = req.body;
  User.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      res.json({ msg: 'Invalid account' });
    } else {
      // Match password
      bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          res.json({ msg: 'success', token: user.token });
        } else {
          res.json({ msg: 'Incorrect password' });
        }
      });

    }
  }).catch(err => {
    console.log(err);
    res.json({ msg: 'server error' });
  })
});

// File upload
router.post('/upload', ensureAuthenticated, function(req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.body.email)
    return res.status(200).redirect('/dashboard');
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(200).redirect('/dashboard');
  }


  sampleFile = req.files.sampleFile;
  uploadPath = './assets/images/' + sampleFile.name;
  User.findOne({ email: req.body.email }).then(user => {
    if (sampleFile.mimetype !== 'image/jpg' && sampleFile.mimetype !== 'image/jpeg' && sampleFile.mimetype !== 'image/png') {
      console.log(sampleFile.mimetype)
      return res.status(200).redirect('/dashboard');
    }  
    var oldPhoto = './assets' + user.photo; 
    fs.unlink(oldPhoto, (err) => {
      if (err) {
        console.error(err)
        return
      }
    });
    user.photo = '/images/' + sampleFile.name;
    user.save().then().catch(err => console.log(err));
    sampleFile.mv(uploadPath, function(err) {
      if (err)
        return res.status(500).send(err);
        
        
        return res.status(200).redirect('/dashboard');
    });
  }).catch(err => console.log(err));  
});

module.exports = router;
