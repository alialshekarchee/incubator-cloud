// const User = require("../models/User");

module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }     
    res.redirect('/dashboard');      
  }
};


// User.findOne(req.email).then(user => {user.role === 'god' ? res.redirect('/admindashboard') : res.redirect('/dashboard');}).catch(err => console.log(err));   