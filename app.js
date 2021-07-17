const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const Connection = require('./models/Connection');
const fileUpload = require('express-fileupload');
const BLANK_DEVICE_PASSPHRASE = 'YK$gkE%YdFzTbt%NyK%fBN&-z83AP@hV*ey?RfJ8G?Z5WX3@rs!b+*@KUBjGx36tQDMqr5q89NS#w&Ye3F$tr6Yp?Gaj-d79StJD8D-2suhQVwX@jzQ?22P%G#QyfvP&V@q*HG_2QnJ#AA3m+VVGvk_w?#GKE58cF-ZHW$YRrW4Q9uHcsk2AfP5FeUcg$*!_grbV?KV9%Y?Un8MLLSb@mX*=?!dLJ$tHZF*tXMxtVyuPQ@gs2qZk@ZBDQtd&epv+'

const app = express();

const http = require('http').Server(app);
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
  .then(() => {
    console.log('MongoDB Connected');
    // Flush the connection table on server start
    Connection.find()
      .then(connections => {
        connections.forEach(conn => {
          conn.delete().then().catch((err) => console.log(err));
        });
      })
      .catch(err => {
        console.log(err);
        socket.emit({ msg: 'server error' });
      });
  })
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

// Express static
app.use(express.static('assets'));

// Express file upload
app.use(fileUpload());

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
app.use('/api', require('./routes/api.js'));

// Websocket implemintation
io.on('connection', socket => {
  console.log('a user connected: ' + socket.id);
  // socket.emit('payload', 'Welcome');
  // io.to(socket.id).emit('payload', 'Welcome');
  // Load Connection model
  const conn = new Connection();

  socket.on('payload', payload => {
    if (payload.token) {  // check if the connection request is comming from linked device or an authorized viewer
      User.findOne({ token: payload.token })
        .then(user => {
          if (!user) {
            socket.emit({ msg: 'invalid token' });
            console.log('invalid access');
            socket.disconnect();
          } else {
            if (payload.request.msg === 'register') {
              if (payload.client !== 'viewer') {
                console.log(payload)
                Device.findOne({ uuid: payload.client })
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
                conn.destination = payload.request.destination;
                console.log(conn);
                conn.save().then(() => console.log('connection saved!')).catch((err) => console.log(err));
                // console.log('token from ( ' + socket.id + ' ): ' + payload.token);
              }
            } else {
              if (payload.client !== 'viewer') {
                Connection.find({ token: payload.token })
                  .then(connections => {
                    console.log(`${connections.length} clients available`);
                    connections.forEach(conn => {
                      if (conn.destination === payload.client) {
                        io.to(conn.connection).emit('payload', payload.request.msg);
                      }
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
                      if (device.uuid === payload.request.destination) {
                        io.to(device.connection).emit('register', payload.request.msg);
                        console.log(payload.request.msg + " to " + payload.request.destination + " on socket: " + device.connection);
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
    } else if (payload.blank_device_passphrase) {     // check if the connection request is comming from new, unlinked device
      if (BLANK_DEVICE_PASSPHRASE === payload.blank_device_passphrase) {
        if (payload.uuid) {
          Device.findOne({ uuid: payload.uuid }).then(device => {
            if (!device) {
              socket.emit({ msg: 'device not registered' });
              console.log('device not registered');
              socket.disconnect();
            } else {
              device.status = 'online';
              device.save().then(() => console.log(`device ${device.uuid} online`)).catch(err => console.log(err));
            }
          }).catch(err => console.log(err));
        } else {
          socket.emit({ msg: 'access denied' });
          console.log('access denied');
          socket.disconnect();
        }
      } else {
        socket.emit({ msg: 'access denied' });
        console.log('access denied');
        socket.disconnect();
      }
    } else {
      socket.emit({ msg: 'access denied' });
      console.log('access denied');
      socket.disconnect();
    }
  });

  socket.on('disconnect', () => {   
    Device.findOne({ connection: socket.id }).then(device => {
      if (!device) {
        conn.delete().then(() => console.log('viewer deleted!')).catch((err) => console.log(err));
      } else {
        device.status = 'offline';
        device.save().then(() => console.log(`device ${device.uuid} offline`)).catch(err => console.log(err));
      }
    }).catch(err => console.log(err));
  });

});

// const d = new Device({name: 'mock esp', token: 'eyJhbGciOiJIUzI1NiJ9.ZGV2QGlxdC5ydW4.KJLx3aW-KU2MxUvLTD9BoR2anhtIiJU3Hf0SbW3Kvis', uuid: '9999'});
// d.save().then(console.log('device created')).catch(err => console.log(err));

const PORT = process.env.PORT || 5050;

http.listen(PORT, console.log(`Server running on  ${PORT}`));
