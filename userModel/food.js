const mongoose = require('mongoose');

// Define the schema for LightRequest
const FoodRequestSchema = new mongoose.Schema({
    fname:{
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
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
const FoodRequest = mongoose.model('FoodRequest', FoodRequestSchema);

module.exports = FoodRequest;
