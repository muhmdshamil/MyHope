const mongoose = require('mongoose');

// Define the schema for LightRequest
const ClothRequestSchema = new mongoose.Schema({
    fname:{
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: ['donate', 'request'],  // Only allow "donate" or "request" as values
        required: true
    },
    message: {
        type: String,
        default: ''  // Optional field, will be empty if not provided
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
}, { timestamps: true });

// Create the model from the schema
const ClothRequest = mongoose.model('ClothRequest', ClothRequestSchema);

module.exports = ClothRequest;
