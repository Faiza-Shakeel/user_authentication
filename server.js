require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt= require('bcrypt')
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const {jwtAuthMiddleware,generate_token} =require("./jwt")

const app = express();
app.use(express.json());

app.use(passport.initialize()); // No sessions

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Passport Local Strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: 'User not found' });
      const ispasswordmatch=await user.comparePassword(password)

      if(!ispasswordmatch){
        return done(null, false, { message: 'Wrong password' })
        
      } 

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Routes
app.get('/', (req, res) => res.send('Home Page'));

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = new User({ username, password });
    const response = await newUser.save();
    
   
  } catch (err) {
    res.send(err.message);
  }
});

app.post('/login', passport.authenticate('local', { session: false }),
  (req, res) => {
    const payload = {
      username: req.user.username,
      id: req.user._id
    };
     // generating token
    const token = generate_token(payload);
    console.log({payload:payload ,token:token})
 
    res.send(`Welcome ${req.user.username}, you are logged in`);
  }
);
app.get('/profile', jwtAuthMiddleware, (req, res) => {
  res.send(`Hello ${req.user.userdata.username} `);
});
 
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
