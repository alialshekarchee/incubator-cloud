const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const Connection = require('./models/Connection');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);
// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;
const User = require('./models/User');
const Device = require('./models/Device');

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));





io.on('connection', (socket) => {
  console.log('a user connected: ' + socket.id);
  // Load Connection model
  const conn = new Connection();
  // handle the event sent with socket.send()

  // socket.on('chat', msg => {
  //   console.log('message from ( ' + socket.id + ' ): ' + msg);
  // });

  socket.on('payload', payload => {
    User.findOne({ token: payload.token })
      .then(user => {
        if (!user) {
          socket.emit({ msg: 'invalid token' });
          console.log('invalid access');
          socket.disconnect();
        } else {
          if (payload.request === 'register') {
            if (payload.client !== 'viewer') {
              Device.findOne({uuid: payload.client})
                .then(device => {
                  if (!device) {
                    socket.emit({ msg: 'device not registered' });
                    console.log('device not registered');
                    socket.disconnect();
                  } else {
                    device.connection = socket.id;
                    device.save().then(() => console.log('connection saved!')).catch((err) => console.log(err));
                  }
                })
                .catch(err => {
                  console.log(err);
                  socket.emit({ msg: 'server error' });
                });
            } else {
              conn.connection = socket.id;
              conn.token = payload.token;
              conn.client = payload.client;
              conn.save().then(() => console.log('connection saved!')).catch((err) => console.log(err));
              console.log('token from ( ' + socket.id + ' ): ' + payload.token);
            }            
          } else {
            if (payload.client !== 'viewer') {
              Connection.find({ token: payload.token })
                .then(connections => {
                  connections.forEach(conn => {
                    conn.connection.emit(payload.request);
                  });
                })
                .catch(err => {
                  console.log(err);
                  socket.emit({ msg: 'server error' });
                });
            } else {
              Device.find({ token: payload.token })
                .then(devices => {
                  devices.forEach(device => {
                    if (device.uuid === payload.client) {
                      device.connection.emit(payload.request);
                    }
                  });                  
                })
                .catch(err => {
                  console.log(err);
                  socket.emit({ msg: 'server error' });
                });
            }
          }          
        }
      })
      .catch(err => {
        console.log(err);
        socket.emit({ msg: 'server error' });
      });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected: ' + socket.id);
    conn.delete().then(() => console.log('connection deleted!')).catch((err) => console.log(err));
  });

});

const PORT = process.env.PORT || 5050;

http.listen(PORT, console.log(`Server running on  ${PORT}`));
