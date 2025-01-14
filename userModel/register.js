const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String, // Optional, just used for validation during registration, not saved to DB
    // Remove 'required: true' if not storing it in the database
  },
});

const Register = mongoose.model('Register', userSchema);
module.exports = Register;
