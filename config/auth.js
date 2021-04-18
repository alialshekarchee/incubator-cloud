const User = require("../models/User");

module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');
  },
  ensureAdmin: function (req, res, next) {
    User.findOne({ email: req.user.email }).then(user => {
      // console.log(`req.email: ${req.user.email}, and user.email: ${user.email}, and user.role: ${user.role}`);      
      if (user.role === 'god') {
        console.log(`you are authorized, you are a ${user.role}`);
        return next();
      } else {
        // res.status(403);
        res.redirect('/users/login');
        console.log(`you are not authorized, you are a ${user.role}`);
      }
    }).catch(err => console.log(err));
  }
};


