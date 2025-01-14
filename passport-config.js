const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const Register = require('./userModel/register');
const passport = require('passport');

// Define the authentication function
async function authenticateUser(email, password, done) {
  try {
    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase();
    const user = await Register.findOne({ email: normalizedEmail });

    // Check if user exists
    if (!user) {
      console.log(`Authentication failed: No user with email ${normalizedEmail}`);
      return done(null, false, { message: "No user with that email" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Stored password:", user.password);
    console.log("Entered password:", password);
    console.log("Passwords match:", isMatch);

    if (isMatch) {
      console.log(`Authentication successful for email: ${normalizedEmail}`);
      return done(null, user);
    } else {
      console.log(`Authentication failed: Password incorrect for email ${normalizedEmail}`);
      return done(null, false, { message: "Password incorrect" });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return done(error);
  }
}

// Initialize passport with LocalStrategy
passport.use(new LocalStrategy({
  usernameField: 'email', // Use "email" as the username field
  passwordField: 'password' // Use "password" for password field
}, authenticateUser));

// Serialize user (store user ID in session)
passport.serializeUser((user, done) => {
  done(null, user._id); // Save user._id to the session
});

// Deserialize user (fetch user by ID from session)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Register.findById(id);
    done(null, user); // Add user object to req.user
  } catch (err) {
    console.error("Error during deserialization:", err);
    done(err);
  }
});

module.exports = passport; // Export passport for app.js to use
