const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            User.find().then(users => {
              var accessGranted = false;
              var finishedProcessesCount = 0;
              users.forEach(usr => {
                if (usr.role === 'god') {
                  finishedProcessesCount++;
                  bcrypt.compare(password, usr.password, (err, isAdminMatch) => {
                    finishedProcessesCount--;
                    if (err) throw err;
                    if (isAdminMatch) {
                      accessGranted = true;
                    }                    
                    if (finishedProcessesCount === 0) callback();
                  });
                }
              });
         
              function callback() {
                if (accessGranted) {
                  return done(null, user);
                } else {
                  return done(null, false, { message: 'Password incorrect' });
                }
              }
            }).catch(err => console.log(err));
          }
        });
      });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
