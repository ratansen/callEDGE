const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport');
const cookieSession = require('cookie-session');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const session = require('express-session')
const app = express()
require('dotenv').config()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');


const peerServer = ExpressPeerServer(server, {
    debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))


app.use(session({
    resave: false,
    saveUninitialized:true,
    secret: process.env.cookieKey,
}))

// app.use(cookieSession({
//     maxAge: 24 * 60 * 60 * 1000,
//     keys: [keys.session.cookieKey]
// }));
// initialize passport
app.use(passport.initialize());
app.use(passport.session());



mongoose.connect(process.env.dbURI, () => {
    console.log('connected to mongodb');
});


const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/login');
    } else {
        next();
    }
};



app.get('/', authCheck,  (req, res) => {
    console.log(req.user)
    console.log(req.isAuthenticated())
    res.render('home', {user: req.user.username})
})

app.get('/room', (req, res) => {
    res.redirect(`/room/${uuidV4()}`)
})
app.get('/login', (req, res) => {
    res.render('login')
})


app.get('/room/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile']
}));

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

app.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {

    res.redirect('/');
    
});






// -----------socket stuff--------------------------

io.on('connection', socket => {
    console.log("connected")
    const peers = []
    socket.on('join-room', (roomID, userID) => {
        peers.push(userID)
        console.log(userID, "joined in", roomID)
        socket.join(roomID)
        socket.broadcast.to(roomID).emit('user-connected', userID)

        socket.on("send-message", message => {
            console.log("message received in backend", userID)
            socket.broadcast.to(roomID).emit("receive-message", { by: userID, message: message });
        })
        socket.on('disconnect', () => {
            socket.to(roomID).emit('user-disconnected', userID)
        })


    })

})

server.listen(process.env.PORT || 3002)