const mongoose = require('mongoose');

// Define the schema for light donation/request
const lightRequestSchema = new mongoose.Schema({
    fanme:{
       type: String,
       required:true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: ['donate', 'request'],
        required: true
    },
    message: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create and export the model
const LightRequest = mongoose.model('LightRequest', lightRequestSchema);

module.exports = LightRequest;
