const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  blood_group: { type: String, required: true },
  action: { type: String, required: true },
  message: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
});

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
module.exports = BloodRequest;
