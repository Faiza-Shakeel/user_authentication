 require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const { jwtAuthMiddleware, generate_token } = require("./jwt");
const generateotp = require("./utils/generateotp");
const sendmail = require('./utils/sendemail');
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // React app URL
  credentials: true
}));

app.use(passport.initialize());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Passport Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'User not found' });
      const ispasswordmatch = await user.comparePassword(password);

      if (!ispasswordmatch) {
        return done(null, false, { message: 'Wrong password' });
      }

      if (!user.isVerified) {
        return done(null, false, { message: 'Please verify your email first' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

/* ---------------- ROUTES ---------------- */

app.get('/', (req, res) => res.json('Home Page'));

/* -------- REGISTER -------- */
 app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const newUser = new User({ username, password, email, isVerified: false });

    const savedUser = await newUser.save();

    // Generate OTP
    const otp = generateotp();
    savedUser.otp = otp;
    savedUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await savedUser.save();

    // Send OTP
    await sendmail(savedUser.email, otp);

    res.json({
      message: "User registered. OTP sent to email for verification.",
      email: savedUser.email
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* -------- VERIFY REGISTRATION OTP -------- */
app.post('/verify-register-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "User not found" });

    if (!user.otpExpires || user.otpExpires.getTime() < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }
     if (!user.otp || user.otp !== otp.toString()) {
  return res.status(400).json({ error: "Invalid OTP" });
}

    // Mark user as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Email verified successfully! You can now login." });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
});

/* -------- LOGIN -------- */
/* -------- LOGIN (without OTP) -------- */
app.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (!user) return res.status(400).json({ error: info.message || "Invalid credentials" });

    // Generate JWT token
    const token = generate_token(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        username: user.username,
        email: user.email
      }
    });
  })(req, res, next);
});



/* -------- PROFILE -------- */
app.get('/profile', jwtAuthMiddleware, (req, res) => {
  res.json(`Hello ${req.user.userdata.username}`);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
